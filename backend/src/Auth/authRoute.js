const express = require("express");
const router = express.Router();
const authController = require("./authController");

router.post("/send-verification", authController.sendVerification);

module.exports = router;
