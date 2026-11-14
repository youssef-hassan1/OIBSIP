
import nodemailer from "nodemailer";

let transporter;

const getTransporter = async () => {
  if (!transporter) {
    const testAccount = await nodemailer.createTestAccount();

    transporter = nodemailer.createTransport({
  host: testAccount.smtp.host,
  port: testAccount.smtp.port,
  secure: testAccount.smtp.secure,
  auth: {
    user: testAccount.user,
    pass: testAccount.pass,
  },
  tls: {
    rejectUnauthorized: false,
  },
});
  }

  return transporter;
};

// Send email verification link
export const sendVerificationEmail = async (email, token) => {
  const mailer = await getTransporter();

  const info = await mailer.sendMail({
    from: '"Oasis Pizza" <no-reply@oasispizza.test>',
    to: email,
    subject: "Verify Your Email",
    html: `
      <h2>Welcome to Oasis Pizza!</h2>
      <p>Please verify your email using the link below:</p>
      <a href="${process.env.API_URL}/api/auth/verify-email?token=${token}">
        Verify Email
      </a>
    `,
  });

  console.log("Email preview:", nodemailer.getTestMessageUrl(info));
};

// Send password reset link
export const sendPasswordResetEmail = async (email, token) => {
  const mailer = await getTransporter();

  const info = await mailer.sendMail({
    from: '"Oasis Pizza" <no-reply@oasispizza.test>',
    to: email,
    subject: "Reset Your Password",
    html: `
      <h2>Password Reset</h2>
      <p>Click the link below to reset your password:</p>
      <a href="${process.env.API_URL}/api/auth/reset-password?token=${token}">
        Reset Password
      </a>
    `,
  });

  console.log("Password reset email preview:", nodemailer.getTestMessageUrl(info));
};

// Send low-stock alert to admin
export const sendLowStockAlert = async (item) => {
  const mailer = await getTransporter();

  const info = await mailer.sendMail({
    from: '"Oasis Pizza" <no-reply@oasispizza.test>',
    to: process.env.ADMIN_EMAIL,
    subject: `Low Stock Alert: ${item.name}`,
    html: `
      <h2>Low Stock Alert</h2>
      <p>The following inventory item is running low:</p>
      <ul>
        <li><strong>Item:</strong> ${item.name}</li>
        <li><strong>Current Quantity:</strong> ${item.quantity} ${item.unit}</li>
        <li><strong>Threshold:</strong> ${item.lowStockThreshold}</li>
      </ul>
      <p>Please restock this item.</p>
    `,
  });

  console.log("Low-stock email preview:", nodemailer.getTestMessageUrl(info));
};

// Send order status update to customer
export const sendOrderStatusEmail = async (email, order) => {
  const mailer = await getTransporter();

  const info = await mailer.sendMail({
    from: '"Oasis Pizza" <no-reply@oasispizza.test>',
    to: email,
    subject: `Order Update - ${order._id}`,
    html: `
      <h2>Your Order Has Been Updated!</h2>
      <p>Your Oasis Pizza order status is now:</p>
      <h3>${order.status}</h3>
      <p>Order ID: ${order._id}</p>
      <p>Thank you for choosing Oasis Pizza!</p>
    `,
  });

  console.log(
    "Order status email preview:",
    nodemailer.getTestMessageUrl(info)
  );
};
