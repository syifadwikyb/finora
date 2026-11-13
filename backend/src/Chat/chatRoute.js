const express = require("express");
const router = express.Router();
const chatController = require("./chatController");

router.post("/", chatController.chat);
router.post("/execute", chatController.execute);
router.get("/health", chatController.health);

module.exports = router;