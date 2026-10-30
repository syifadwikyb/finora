const allocationRepository = require("./allocationRepository");
const accountRepository = require("../Accounts/accountRepository");

const getAllAllocations = async (userId, filters = {}) => {
  return await allocationRepository.findAllAllocations(userId, filters.accountId || null);
};

const getAllocationById = async (id, userId) => {
  if (!id || isNaN(id)) {
    const error = new Error("Invalid allocation ID");
    error.statusCode = 400;
    throw error;
  }
  const allocation = await allocationRepository.findAllocationById(id, userId);
  if (!allocation) {
    const error = new Error("Allocation not found");
    error.statusCode = 404;
    throw error;
  }
  return allocation;
};

const createAllocation = async (data) => {
  if (!data.user_id) {
    const error = new Error("User ID is required");
    error.statusCode = 400;
    throw error;
  }
  if (!data.name || typeof data.name !== "string" || data.name.trim() === "") {
    const error = new Error("Allocation name is required");
    error.statusCode = 400;
    throw error;
  }
  if (!data.account_id || isNaN(data.account_id)) {
    const error = new Error("Valid account_id is required");
    error.statusCode = 400;
    throw error;
  }

  // Cek apakah account milik user
  const account = await accountRepository.findAccountById(data.account_id, data.user_id);
  if (!account) {
    const error = new Error("Account not found");
    error.statusCode = 404;
    throw error;
  }

  const targetAmount = Number(data.target_amount) || 0;
  if (targetAmount < 0) {
    const error = new Error("Target amount cannot be negative");
    error.statusCode = 400;
    throw error;
  }

  const initialBalance = Number(data.current_balance) || 0;
  if (initialBalance < 0) {
    const error = new Error("Current balance cannot be negative");
    error.statusCode = 400;
    throw error;
  }

  const allocationData = {
    user_id: data.user_id,
    account_id: Number(data.account_id),
    name: data.name.trim(),
    target_amount: targetAmount,
    current_balance: initialBalance,
  };

  return await allocationRepository.createAllocation(allocationData);
};

const updateAllocation = async (id, userId, data) => {
  if (!id || isNaN(id)) {
    const error = new Error("Invalid allocation ID");
    error.statusCode = 400;
    throw error;
  }

  const existing = await allocationRepository.findAllocationById(id, userId);
  if (!existing) {
    const error = new Error("Allocation not found");
    error.statusCode = 404;
    throw error;
  }

  if (data.account_id) {
    const account = await accountRepository.findAccountById(data.account_id, userId);
    if (!account) {
      const error = new Error("Account not found");
      error.statusCode = 404;
      throw error;
    }
  }

  if (data.name !== undefined && (typeof data.name !== "string" || data.name.trim() === "")) {
    const error = new Error("Allocation name cannot be empty");
    error.statusCode = 400;
    throw error;
  }

  const updateData = {
    name: data.name ? data.name.trim() : undefined,
    account_id: data.account_id ? Number(data.account_id) : undefined,
    target_amount: data.target_amount !== undefined ? Number(data.target_amount) : undefined,
  };

  return await allocationRepository.updateAllocation(id, userId, updateData);
};

const deleteAllocation = async (id, userId) => {
  if (!id || isNaN(id)) {
    const error = new Error("Invalid allocation ID");
    error.statusCode = 400;
    throw error;
  }

  const existing = await allocationRepository.findAllocationById(id, userId);
  if (!existing) {
    const error = new Error("Allocation not found");
    error.statusCode = 404;
    throw error;
  }

  return await allocationRepository.deleteAllocation(id, userId);
};

module.exports = {
  getAllAllocations,
  getAllocationById,
  createAllocation,
  updateAllocation,
  deleteAllocation,
};

