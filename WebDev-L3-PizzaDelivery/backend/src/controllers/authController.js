import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import crypto from "crypto";
import { sendVerificationEmail,
         sendPasswordResetEmail,
 } from "../utils/emailService.js";

export const registerUser = async (req, res) => {
    try {
        const { name, email, password, phone, address } = req.body;

        // 1. Validate required fields
        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Name, email, and password are required",
            });
        }

        // 2. Check if email already exists
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(409).json({
                message: "Email is already registered",
            });
        }

        // 3. Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 4. Generate email verification token
        const verificationToken = crypto.randomBytes(32).toString("hex");

        // 5. Hash the verification token before saving it
        const hashedVerificationToken = crypto
            .createHash("sha256")
            .update(verificationToken)
            .digest("hex");

        // 6. Set token expiration (15 minutes)
        const verificationExpires = Date.now() + 15 * 60 * 1000;

        // 7. Create the user
        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
            phone,
            address,
            isEmailVerified: false,
            emailVerificationToken: hashedVerificationToken,
            emailVerificationExpires: verificationExpires,
        });


        // 9. Send verification email
        try {
            await sendVerificationEmail(email, verificationToken);
        } catch (emailError) {
            // Remove user if email sending fails
            await User.findByIdAndDelete(newUser._id);
            throw emailError;
        }

        // 10. Send response
        return res.status(201).json({
            message: "Registration successful. Please check your email to verify your account.",
        });

    } catch (error) {
        console.error("Registration error:", error);

        return res.status(500).json({
            message: "Internal server error",
        });
    }
};
export const loginUser = async (req,res) => {
    try{
        const{email, password} = req.body;

        if(!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }
        const user = await User.findOne({email});

        if(!user){
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }
        if (!user.isEmailVerified) {
            return res.status(403).json({
                message: "Please verify your email before logging in",
            });
        }
        
            const isPasswordCorrect = await bcrypt.compare(
                password,
                user.password
            );
            if(!isPasswordCorrect) {
                return res.status(401).json({
                    message: "Invalid email or password",
                });
            }
            const token = jwt.sign(
                {
                    id: user._id,
                    role: user.role,
                },
                process.env.JWT_SECRET,
                {
                    expiresIn: "7d",
                }
            );
            return res.status(200).json({
                message: "Login successfully",
                token,
                user:{
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                },
            });
        } catch (error) {
            console.error("Login error:", error);
            return res.status(500).json({
                message: "Internal server error",
            });
        }
    };
    export const getProfile = async (req, res) => {
        try{
            const user = await User.findById(req.user.id).select("-password");
            if(!user) {
                return res.status(404).json({
                    message: "User not found",
                });
            }
            return res.status(200).json({
                message: "Profile retrieved successfully",
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    address: user.address,
                    role: user.role,
                    isEmailVerified: user.isEmailVerified,
                },
            });
        }catch(error) {
            console.error("Get profile error", error);
            return res.status(500).json({
                message: "Internal server error",
            });
        }
    };
    export const verifyEmail = async (req, res) => {
        try{
            const{token} = req.query;
            if(!token) {
                return res.status(400).json({
                    message: "Verification token is required",
                });
            }
            const hashedToken = crypto
            .createHash("sha256")
            .update(token)
            .digest("hex");
            
            const user = await User.findOne({
                emailVerificationToken: hashedToken,
                emailVerificationExpires: { $gt:new Date()},
            });
        if(!user){
            return res.status(400).json({
                message: "Invaild or expired link",
            });
        }
        user.isEmailVerified = true;
        user.emailVerificationToken = null;
        user.emailVerificationExpires = null;
        await user.save();
        return res.status(200).json({
            message: "Email verified successfully!",
        });
    }catch (error) {
        console.error("Email verification error:", error);
        return res.status(500).json({
            message: "Internal server error",
        });
    }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    const user = await User.findOne({ email });


    if (!user) {
      return res.status(200).json({
        message: "If the email exists, a reset link will be sent",
      });
    }

    // Generate a random reset token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Hash the token before storing it
    const hashedResetToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Set token expiration to 15 minutes
    user.passwordResetToken = hashedResetToken;
    user.passwordResetExpires = Date.now() + 15 * 60 * 1000;

    await user.save();

    // Create reset URL

    try {
      await sendPasswordResetEmail(email, resetToken);
    } catch (emailError) {
      user.passwordResetToken = null;
      user.passwordResetExpires = null;
      await user.save();

      throw emailError;
    }

    return res.status(200).json({
      message: "If the email exists, a reset link will be sent",
    });
  } catch (error) {
    console.error("Forgot password error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.query;
    const { password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        message: "Token and new password are required",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters",
      });
    }

    // Hash the received token
    const hashedResetToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // Find user with a valid, non-expired token
    const user = await User.findOne({
      passwordResetToken: hashedResetToken,
      passwordResetExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired reset link",
      });
    }

    // Hash the new password
    user.password = await bcrypt.hash(password, 10);

    // Clear reset token after successful use
    user.passwordResetToken = null;
    user.passwordResetExpires = null;

    await user.save();

    return res.status(200).json({
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("Reset password error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};