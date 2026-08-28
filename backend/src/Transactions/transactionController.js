const transactionService = require("./transactionService");

const getTransactions = async (req, res) => {
  try {
    const result = await transactionService.getAllTransactions(req.query);
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
    const transaction = await transactionService.getTransactionById(id);
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
    const transaction = await transactionService.createTransaction(req.body);
    res.status(201).json({
      success: true,
      message: "Transaction created successfully",
      data: transaction,
    });
  } catch (error) {
    console.error("[ERROR]", error.message);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to create transaction",
    });
  }
};

const updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const transaction = await transactionService.updateTransaction(id, req.body);
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
    await transactionService.deleteTransaction(id);
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
