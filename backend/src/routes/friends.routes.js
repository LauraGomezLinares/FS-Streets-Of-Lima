const express = require("express");
const router = express.Router();
const friendsController = require("../controllers/friends.controller");

const { authMiddleware } = require("../middleware/auth.middleware"); 

// Todas las rutas de amigos requieren estar autenticado
router.use(authMiddleware);

router.get("/search", friendsController.searchUsers);
router.post("/request", friendsController.sendRequest);
router.get("/requests", friendsController.getPendingRequests);
router.put("/:friendshipId/respond", friendsController.respondRequest);
router.get("/", friendsController.getFriendsList);

module.exports = router;