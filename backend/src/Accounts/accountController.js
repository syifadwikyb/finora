const accountService = require("./accountService");

const getAccounts = async (req, res) => {
  try {
    const userId = req.query.userId;
    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID is required" });
    }

    const accounts = await accountService.getAllAccounts(userId);
    res.status(200).json({
      success: true,
      message: "Accounts fetched successfully",
      data: accounts,
    });
  } catch (error) {
    console.error("[ERROR]", error.message);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to fetch accounts",
    });
  }
};

const getAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.query.userId;
    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID is required" });
    }

    const account = await accountService.getAccountById(id, userId);
    res.status(200).json({
      success: true,
      message: "Account fetched successfully",
      data: account,
    });
  } catch (error) {
    console.error("[ERROR]", error.message);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to fetch account",
    });
  }
};

const createAccount = async (req, res) => {
  try {
    const newAccount = await accountService.createAccount(req.body);
    res.status(201).json({
      success: true,
      message: "Account created successfully",
      data: newAccount,
    });
  } catch (error) {
    console.error("[ERROR]", error.message);
    res.status(error.statusCode || 400).json({
      success: false,
      message: error.message || "Failed to create account",
    });
  }
};

const updateAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.body.user_id || req.query.userId;
    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID is required" });
    }

    const updatedAccount = await accountService.updateAccount(id, userId, req.body);
    res.status(200).json({
      success: true,
      message: "Account updated successfully",
      data: updatedAccount,
    });
  } catch (error) {
    console.error("[ERROR]", error.message);
    res.status(error.statusCode || 400).json({
      success: false,
      message: error.message || "Failed to update account",
    });
  }
};

const deleteAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.query.userId || req.body.user_id;
    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID is required" });
    }

    const deletedAccount = await accountService.deleteAccount(id, userId);
    res.status(200).json({
      success: true,
      message: "Account deleted successfully",
      data: deletedAccount,
    });
  } catch (error) {
    console.error("[ERROR]", error.message);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to delete account",
    });
  }
};

module.exports = {
  getAccounts,
  getAccount,
  createAccount,
  updateAccount,
  deleteAccount,
};

