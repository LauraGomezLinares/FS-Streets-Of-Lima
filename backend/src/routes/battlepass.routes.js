const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware/auth.middleware"); 
const bpController = require("../controllers/battlepass.controller");

router.get("/", authMiddleware, bpController.getProgress);
router.post("/claim", authMiddleware, bpController.claimReward);
router.post("/dev-xp", authMiddleware, bpController.addDevXp);
router.post("/match-xp", authMiddleware, bpController.saveMatchXp);

module.exports = router;