const express = require("express");
const rateLimit = require("express-rate-limit");
const authMiddleware = require("../middleware/auth.middleware");
const {
  register,
  login,
  verifyOtp,
  resendOtp,
  me,
} = require("../controllers/auth.controller");

const router = express.Router();

// Requerimiento 7: limita intentos de login para evitar fuerza bruta
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10,
  message: { error: "Demasiados intentos. Intenta de nuevo en 15 minutos." },
});

router.post("/register", register);
router.post("/login", loginLimiter, login);
router.post("/verify-otp", loginLimiter, verifyOtp);
router.post("/resend-otp", loginLimiter, resendOtp);
router.get("/me", authMiddleware, me);

module.exports = router;
