const transactionRepository = require("./transactionRepository");
const categoryRepository = require("../Categories/categoryRepository");

const getAllTransactions = async (filters = {}) => {
  return await transactionRepository.findAllTransactions(filters);
};

const getTransactionById = async (id) => {
  if (!id || isNaN(id)) {
    const error = new Error("Invalid transaction ID");
    error.statusCode = 400;
    throw error;
  }

  const transaction = await transactionRepository.findTransactionById(id);
  if (!transaction) {
    const error = new Error("Transaction not found");
    error.statusCode = 404;
    throw error;
  }

  return transaction;
};

const createTransaction = async (data) => {
  if (!data.title || typeof data.title !== "string" || data.title.trim() === "") {
    const error = new Error("Title is required");
    error.statusCode = 400;
    throw error;
  }

  const amount = Number(data.amount);
  if (isNaN(amount) || amount <= 0) {
    const error = new Error("Amount must be greater than 0");
    error.statusCode = 400;
    throw error;
  }

  if (!["income", "expense"].includes(data.type)) {
    const error = new Error("Type must be either income or expense");
    error.statusCode = 400;
    throw error;
  }

  if (!data.category_id || isNaN(data.category_id)) {
    const error = new Error("Valid category_id is required");
    error.statusCode = 400;
    throw error;
  }

  const category = await categoryRepository.findCategoryById(data.category_id);
  if (!category) {
    const error = new Error("Category not found");
    error.statusCode = 404;
    throw error;
  }

  if (!data.transaction_date) {
    const error = new Error("Transaction date is required");
    error.statusCode = 400;
    throw error;
  }

  const transactionData = {
    title: data.title.trim(),
    amount: amount,
    type: data.type,
    category_id: Number(data.category_id),
    description: data.description ? String(data.description).trim() : null,
    transaction_date: data.transaction_date,
  };

  return await transactionRepository.createTransaction(transactionData);
};

const updateTransaction = async (id, data) => {
  if (!id || isNaN(id)) {
    const error = new Error("Invalid transaction ID");
    error.statusCode = 400;
    throw error;
  }

  const existingTransaction = await transactionRepository.findTransactionById(id);
  if (!existingTransaction) {
    const error = new Error("Transaction not found");
    error.statusCode = 404;
    throw error;
  }

  const title = data.title !== undefined ? data.title : existingTransaction.title;
  if (!title || typeof title !== "string" || title.trim() === "") {
    const error = new Error("Title is required");
    error.statusCode = 400;
    throw error;
  }

  let amount = existingTransaction.amount;
  if (data.amount !== undefined) {
    amount = Number(data.amount);
    if (isNaN(amount) || amount <= 0) {
      const error = new Error("Amount must be greater than 0");
      error.statusCode = 400;
      throw error;
    }
  }

  let type = existingTransaction.type;
  if (data.type !== undefined) {
    if (!["income", "expense"].includes(data.type)) {
      const error = new Error("Type must be either income or expense");
      error.statusCode = 400;
      throw error;
    }
    type = data.type;
  }

  let category_id = existingTransaction.category_id;
  if (data.category_id !== undefined) {
    if (isNaN(data.category_id)) {
      const error = new Error("Valid category_id is required");
      error.statusCode = 400;
      throw error;
    }
    category_id = Number(data.category_id);
    const category = await categoryRepository.findCategoryById(category_id);
    if (!category) {
      const error = new Error("Category not found");
      error.statusCode = 404;
      throw error;
    }
  }

  const transaction_date = data.transaction_date || existingTransaction.transaction_date;

  const transactionData = {
    title: String(title).trim(),
    amount: amount,
    type: type,
    category_id: category_id,
    description: data.description !== undefined ? (data.description ? String(data.description).trim() : null) : existingTransaction.description,
    transaction_date: transaction_date,
  };

  return await transactionRepository.updateTransaction(id, transactionData);
};

const deleteTransaction = async (id) => {
  if (!id || isNaN(id)) {
    const error = new Error("Invalid transaction ID");
    error.statusCode = 400;
    throw error;
  }

  const existingTransaction = await transactionRepository.findTransactionById(id);
  if (!existingTransaction) {
    const error = new Error("Transaction not found");
    error.statusCode = 404;
    throw error;
  }

  return await transactionRepository.deleteTransaction(id);
};

module.exports = {
  getAllTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
};
