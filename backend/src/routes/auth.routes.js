const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");

// 🚨 REVISA ESTA LÍNEA: Asegúrate de usar llaves { authMiddleware } 
// para extraer solo la función y no todo el objeto.
const { authMiddleware } = require("../middleware/auth.middleware"); 

// Rutas Públicas (POST)
router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/verify-otp", authController.verifyOtp);
router.post("/resend-otp", authController.resendOtp);

// Ruta Protegida (GET)
router.get("/me", authMiddleware, authController.me);
router.post("/save-playtime", authMiddleware, authController.savePlaytime);
router.get("/role", authMiddleware.verifyToken, authController.checkRole);

module.exports = router;