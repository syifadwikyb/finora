const accountRepository = require("./accountRepository");

const getAllAccounts = async (userId) => {
  return await accountRepository.findAllAccounts(userId);
};

const getAccountById = async (id, userId) => {
  if (!id || isNaN(id)) {
    const error = new Error("Invalid account ID");
    error.statusCode = 400;
    throw error;
  }
  const account = await accountRepository.findAccountById(id, userId);
  if (!account) {
    const error = new Error("Account not found");
    error.statusCode = 404;
    throw error;
  }
  return account;
};

const createAccount = async (data) => {
  if (!data.user_id) {
    const error = new Error("User ID is required");
    error.statusCode = 400;
    throw error;
  }
  if (!data.name || typeof data.name !== "string" || data.name.trim() === "") {
    const error = new Error("Account name is required");
    error.statusCode = 400;
    throw error;
  }

  const initialBalance = Number(data.current_balance) || 0;
  if (initialBalance < 0) {
    const error = new Error("Current balance cannot be negative");
    error.statusCode = 400;
    throw error;
  }

  const accountData = {
    user_id: data.user_id,
    name: data.name.trim(),
    type: data.type ? data.type.trim() : "bank",
    account_number: data.account_number ? String(data.account_number).trim() : null,
    current_balance: initialBalance,
  };

  return await accountRepository.createAccount(accountData);
};

const updateAccount = async (id, userId, data) => {
  if (!id || isNaN(id)) {
    const error = new Error("Invalid account ID");
    error.statusCode = 400;
    throw error;
  }

  const existing = await accountRepository.findAccountById(id, userId);
  if (!existing) {
    const error = new Error("Account not found");
    error.statusCode = 404;
    throw error;
  }

  if (data.name !== undefined && (typeof data.name !== "string" || data.name.trim() === "")) {
    const error = new Error("Account name cannot be empty");
    error.statusCode = 400;
    throw error;
  }

  const accountData = {
    name: data.name ? data.name.trim() : undefined,
    type: data.type ? data.type.trim() : undefined,
    account_number: data.account_number !== undefined ? (data.account_number ? String(data.account_number).trim() : null) : undefined,
  };

  return await accountRepository.updateAccount(id, userId, accountData);
};

const deleteAccount = async (id, userId) => {
  if (!id || isNaN(id)) {
    const error = new Error("Invalid account ID");
    error.statusCode = 400;
    throw error;
  }

  const existing = await accountRepository.findAccountById(id, userId);
  if (!existing) {
    const error = new Error("Account not found");
    error.statusCode = 404;
    throw error;
  }

  return await accountRepository.deleteAccount(id, userId);
};

module.exports = {
  getAllAccounts,
  getAccountById,
  createAccount,
  updateAccount,
  deleteAccount,
};

