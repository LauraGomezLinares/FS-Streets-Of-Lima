const express = require("express");
const { authMiddleware, adminMiddleware } = require("../middleware/auth.middleware"); // 👈 Con llaves y en singular
const { listUsers, banUser, getStats } = require("../controllers/admin.controller");

const router = express.Router();

// Ahora que ambas funciones existen en auth.middleware.js, ya no llegará como undefined
router.use(authMiddleware, adminMiddleware);

router.get("/users", listUsers);
router.patch("/users/:id/ban", banUser);
router.get("/stats", getStats);

module.exports = router;