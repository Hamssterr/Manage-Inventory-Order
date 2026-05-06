import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST || "smtp.gmail.com",
  port: parseInt(process.env.MAIL_PORT || "587"),
  secure: process.env.MAIL_SECURE === "true", // true for 465, false for other ports
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

// Kiểm tra kết nối khi khởi động
transporter.verify((error, success) => {
  if (error) {
    console.error("Mail server connection error:", error);
  } else {
    console.log("Mail server is ready to take messages");
  }
});

export default transporter;
