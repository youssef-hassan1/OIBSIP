import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { registerUser,
         loginUser,
         getProfile,
         verifyEmail,
         forgotPassword,
         resetPassword,
} from "../controllers/authController.js";

const router = express.Router();

// Test route
router.get("/test", (req, res) => {
  res.json({
    message: "Auth routes are working!",
  });
});

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", protect, getProfile);
router.get("/verify-email", verifyEmail);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);


export default router;