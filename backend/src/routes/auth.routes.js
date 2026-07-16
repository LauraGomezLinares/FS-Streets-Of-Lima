const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");

const { authMiddleware } = require("../middleware/auth.middleware"); 

// Rutas Públicas (POST)
router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/verify-otp", authController.verifyOtp);
router.post("/resend-otp", authController.resendOtp);

// Ruta Protegida (GET)
router.get("/me", authMiddleware, authController.me);
router.post("/save-playtime", authMiddleware, authController.savePlaytime);
router.get("/role", authMiddleware, authController.checkRole);
router.post("/buy-skill", authMiddleware, authController.buySkill);
router.get("/leaderboard", authController.getLeaderboard);

module.exports = router;