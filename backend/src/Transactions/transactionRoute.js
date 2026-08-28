const express = require("express");
const router = express.Router();
const transactionController = require("./transactionController");

router.get("/", transactionController.getTransactions);
router.get("/:id", transactionController.getTransaction);
router.post("/", transactionController.createTransaction);
router.put("/:id", transactionController.updateTransaction);
router.patch("/:id", transactionController.patchTransaction);
router.delete("/:id", transactionController.deleteTransaction);

module.exports = router;
