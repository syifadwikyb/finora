const pool = require("../config/db");
const transactionRepository = require("./transactionRepository");
const categoryRepository = require("../Categories/categoryRepository");

const TRANSACTION_TYPE = Object.freeze({
  INCOME: "income",
  EXPENSE: "expense",
});

const createHttpError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const formatRupiah = (value) => `Rp ${Number(value).toLocaleString("id-ID")}`;

const assertValidTransactionId = (transactionId) => {
  if (!transactionId || isNaN(transactionId)) {
    throw createHttpError(400, "Invalid transaction ID");
  }
};

const assertValidAmount = (amount) => {
  if (isNaN(amount) || amount <= 0) {
    throw createHttpError(400, "Amount must be greater than 0");
  }
};

const assertValidType = (type) => {
  if (!Object.values(TRANSACTION_TYPE).includes(type)) {
    throw createHttpError(400, "Type must be either income or expense");
  }
};

const runInTransaction = async (callback) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await callback(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

const summarizeAllocations = (totalAmount, allocations) => {
  const validAllocations = (Array.isArray(allocations) ? allocations : [])
    .map((item) => ({ category_id: item.category_id, amount: Number(item.amount) || 0 }))
    .filter((item) => item.amount > 0 && item.category_id);

  const allocatedTotal = validAllocations.reduce((sum, item) => sum + item.amount, 0);

  return {
    validAllocations,
    remainingAmount: totalAmount - allocatedTotal,
  };
};

const decreaseBalance = async (client, categoryId, userId, amount, context) => {
  if (!categoryId || amount <= 0) return;

  const updatedCategory = await categoryRepository.decreaseCategoryBalance(categoryId, amount, client);
  if (updatedCategory) return;

  const category = await categoryRepository.findCategoryById(categoryId, userId, client);
  if (!category) {
    throw createHttpError(404, "Category not found");
  }

  throw createHttpError(
    400,
    `Insufficient balance in "${category.name}" for ${context}. ` +
    `Available: ${formatRupiah(category.current_balance)}, required: ${formatRupiah(amount)}.`
  );
};

const applyTransactionEffect = async (client, { type, amount, categoryId, allocations }, userId) => {
  if (type === TRANSACTION_TYPE.INCOME) {
    const { validAllocations, remainingAmount } = summarizeAllocations(amount, allocations);

    for (const allocation of validAllocations) {
      await categoryRepository.updateCategoryBalance(allocation.category_id, allocation.amount, client);
    }

    if (remainingAmount > 0 && categoryId) {
      await categoryRepository.updateCategoryBalance(categoryId, remainingAmount, client);
    }
    return;
  }

  if (type === TRANSACTION_TYPE.EXPENSE) {
    await decreaseBalance(client, categoryId, userId, amount, "this expense");
  }
};

const reverseTransactionEffect = async (client, transaction, userId, action) => {
  const amount = Number(transaction.amount);

  if (transaction.type === TRANSACTION_TYPE.INCOME) {
    const { validAllocations, remainingAmount } = summarizeAllocations(amount, transaction.allocations);
    const context = `${action} (the funds have already been used)`;

    for (const allocation of validAllocations) {
      await decreaseBalance(client, allocation.category_id, userId, allocation.amount, context);
    }

    if (remainingAmount > 0 && transaction.category_id) {
      await decreaseBalance(client, transaction.category_id, userId, remainingAmount, context);
    }
    return;
  }

  if (transaction.type === TRANSACTION_TYPE.EXPENSE && transaction.category_id) {
    await categoryRepository.updateCategoryBalance(transaction.category_id, amount, client);
  }
};

const getAllTransactions = async (userId, filters = {}) => {
  return await transactionRepository.findAllTransactions(userId, filters);
};

const getTransactionById = async (transactionId, userId) => {
  assertValidTransactionId(transactionId);

  const transaction = await transactionRepository.findTransactionById(transactionId, userId);
  if (!transaction) {
    throw createHttpError(404, "Transaction not found");
  }

  return transaction;
};

const createTransaction = async (payload) => {
  if (!payload.user_id) {
    throw createHttpError(400, "User ID is required");
  }

  if (!payload.title || typeof payload.title !== "string" || payload.title.trim() === "") {
    throw createHttpError(400, "Judul transaksi wajib diisi");
  }

  const amount = Number(payload.amount);
  assertValidAmount(amount);
  assertValidType(payload.type);

  if (!payload.transaction_date) {
    throw createHttpError(400, "Transaction date is required");
  }

  if (!payload.category_id) {
    throw createHttpError(400, "Category is required");
  }

  const primaryCategory = await categoryRepository.findCategoryById(payload.category_id, payload.user_id);
  if (!primaryCategory) {
    throw createHttpError(404, "Category not found");
  }

  // Akun simpanan diambil dari payload, atau dari kategori utama.
  const resolvedAccountId = payload.account_id
    ? Number(payload.account_id)
    : primaryCategory.account_id
      ? Number(primaryCategory.account_id)
      : null;

  const isIncome = payload.type === TRANSACTION_TYPE.INCOME;
  const allocations = isIncome && Array.isArray(payload.allocations) ? payload.allocations : [];

  return runInTransaction(async (client) => {
    const createdTransaction = await transactionRepository.createTransaction(
      {
        title: payload.title.trim(),
        amount,
        type: payload.type,
        category_id: Number(payload.category_id),
        account_id: resolvedAccountId,
        allocation_id: null,
        description: payload.description ? String(payload.description).trim() : null,
        allocations: isIncome ? allocations : null,
        transaction_date: payload.transaction_date,
        user_id: payload.user_id,
      },
      client
    );

    await applyTransactionEffect(
      client,
      { type: payload.type, amount, categoryId: primaryCategory.id, allocations },
      payload.user_id
    );

    return createdTransaction;
  });
};

const updateTransaction = async (transactionId, userId, payload) => {
  assertValidTransactionId(transactionId);

  const existingTransaction = await transactionRepository.findTransactionById(transactionId, userId);
  if (!existingTransaction) {
    throw createHttpError(404, "Transaction not found");
  }

  const title = payload.title !== undefined ? payload.title : existingTransaction.title;
  const amount = payload.amount !== undefined ? Number(payload.amount) : Number(existingTransaction.amount);
  const type = payload.type !== undefined ? payload.type : existingTransaction.type;
  const categoryId =
    payload.category_id !== undefined ? Number(payload.category_id) : existingTransaction.category_id;

  assertValidAmount(amount);
  assertValidType(type);

  let accountId =
    payload.account_id !== undefined
      ? payload.account_id
        ? Number(payload.account_id)
        : null
      : existingTransaction.account_id;

  if (categoryId && !payload.account_id) {
    const category = await categoryRepository.findCategoryById(categoryId, userId);
    if (category && category.account_id) {
      accountId = Number(category.account_id);
    }
  }

  // Alokasi baru hanya berlaku untuk income; bila tidak dikirim, pakai alokasi lama.
  const newAllocations =
    type === TRANSACTION_TYPE.INCOME
      ? Array.isArray(payload.allocations)
        ? payload.allocations
        : payload.allocations !== undefined
          ? []
          : Array.isArray(existingTransaction.allocations)
            ? existingTransaction.allocations
            : []
      : null;

  const transactionChanges = {
    title: title.trim(),
    amount,
    type,
    category_id: categoryId,
    account_id: accountId,
    allocation_id: null,
    description:
      payload.description !== undefined
        ? payload.description
          ? String(payload.description).trim()
          : null
        : existingTransaction.description,
    allocations: newAllocations,
    transaction_date: payload.transaction_date || existingTransaction.transaction_date,
  };

  return runInTransaction(async (client) => {
    // 1. Batalkan efek saldo transaksi lama
    await reverseTransactionEffect(client, existingTransaction, userId, "updating this income");

    // 2. Simpan perubahan transaksi
    const updatedTransaction = await transactionRepository.updateTransaction(
      transactionId,
      userId,
      transactionChanges,
      client
    );

    // 3. Terapkan efek saldo yang baru
    await applyTransactionEffect(
      client,
      { type, amount, categoryId, allocations: newAllocations },
      userId
    );

    return updatedTransaction;
  });
};

const deleteTransaction = async (transactionId, userId) => {
  assertValidTransactionId(transactionId);

  const existingTransaction = await transactionRepository.findTransactionById(transactionId, userId);
  if (!existingTransaction) {
    throw createHttpError(404, "Transaction not found");
  }

  return runInTransaction(async (client) => {
    await reverseTransactionEffect(client, existingTransaction, userId, "deleting this income");

    return transactionRepository.deleteTransaction(transactionId, userId, client);
  });
};

module.exports = {
  getAllTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
};