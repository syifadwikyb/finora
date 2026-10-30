const express = require("express");
const router = express.Router();
const allocationController = require("./allocationController");

router.get("/", allocationController.getAllocations);
router.get("/:id", allocationController.getAllocation);
router.post("/", allocationController.createAllocation);
router.put("/:id", allocationController.updateAllocation);
router.delete("/:id", allocationController.deleteAllocation);

module.exports = router;

