const transactionService = require("./transactionService");

const getTransactions = async (req, res) => {
  try {
    // Ambil userId dari query parameters (?userId=...)
    const userId = req.query.userId;
    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID is required" });
    }

    const result = await transactionService.getAllTransactions(userId, req.query);
    res.status(200).json({
      success: true,
      message: "Transactions fetched successfully",
      data: result.transactions,
      total: result.total,
    });
  } catch (error) {
    console.error("[ERROR]", error.message);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to fetch transactions",
    });
  }
};

const getTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.query.userId; // Ambil userId dari query parameters
    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID is required" });
    }

    const transaction = await transactionService.getTransactionById(id, userId);
    if (!transaction) {
      return res.status(404).json({ success: false, message: "Transaction not found" });
    }

    res.status(200).json({
      success: true,
      message: "Transaction fetched successfully",
      data: transaction,
    });
  } catch (error) {
    console.error("[ERROR]", error.message);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to fetch transaction",
    });
  }
};

const createTransaction = async (req, res) => {
  try {
    if (!req.body.user_id) {
      return res.status(400).json({ success: false, message: "User ID is required" });
    }

    const transaction = await transactionService.createTransaction(req.body);
    res.status(201).json({
      success: true,
      message: "Transaction created successfully",
      data: transaction,
    });
  } catch (error) {
    console.error("[ERROR CREATE TRANSACTION]:", error.message);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to create transaction",
    });
  }
};

const updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.query.userId || req.body.user_id; // Ambil userId dari query atau body
    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID is required" });
    }

    const transaction = await transactionService.updateTransaction(id, userId, req.body);
    if (!transaction) {
      return res.status(404).json({ success: false, message: "Transaction not found or unauthorized" });
    }

    res.status(200).json({
      success: true,
      message: "Transaction updated successfully",
      data: transaction,
    });
  } catch (error) {
    console.error("[ERROR]", error.message);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to update transaction",
    });
  }
};

const patchTransaction = async (req, res) => {
  return updateTransaction(req, res);
};

const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.query.userId; // Ambil userId dari query parameters (?userId=...)
    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID is required" });
    }

    const deleted = await transactionService.deleteTransaction(id, userId);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Transaction not found or unauthorized" });
    }

    res.status(200).json({
      success: true,
      message: "Transaction deleted successfully",
    });
  } catch (error) {
    console.error("[ERROR]", error.message);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to delete transaction",
    });
  }
};

module.exports = {
  getTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  patchTransaction,
  deleteTransaction,
};