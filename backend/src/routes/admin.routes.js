const express = require("express");
const authMiddleware = require("../middleware/auth.middleware");
const adminMiddleware = require("../middleware/admin.middleware");
const { listUsers, banUser, getStats } = require("../controllers/admin.controller");

const router = express.Router();

// Todas las rutas de este archivo requieren: JWT válido + rol ADMIN
router.use(authMiddleware, adminMiddleware);

router.get("/users", listUsers);
router.patch("/users/:id/ban", banUser);
router.get("/stats", getStats);

module.exports = router;
