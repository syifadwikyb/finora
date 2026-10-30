const pool = require("../config/db");
const transactionRepository = require("./transactionRepository");
const categoryRepository = require("../Categories/categoryRepository");
const accountRepository = require("../Accounts/accountRepository");

const getAllTransactions = async (userId, filters = {}) => {
  return await transactionRepository.findAllTransactions(userId, filters);
};

const getTransactionById = async (id, userId) => {
  if (!id || isNaN(id)) {
    const error = new Error("Invalid transaction ID");
    error.statusCode = 400;
    throw error;
  }

  const transaction = await transactionRepository.findTransactionById(id, userId);
  if (!transaction) {
    const error = new Error("Transaction not found");
    error.statusCode = 404;
    throw error;
  }

  return transaction;
};

const createTransaction = async (data) => {
  if (!data.user_id) {
    const error = new Error("User ID is required");
    error.statusCode = 400;
    throw error;
  }

  if (!data.title || typeof data.title !== "string" || data.title.trim() === "") {
    const error = new Error("Judul transaksi wajib diisi");
    error.statusCode = 400;
    throw error;
  }

  const amount = Number(data.amount);
  if (isNaN(amount) || amount <= 0) {
    const error = new Error("Nominal harus lebih besar dari 0");
    error.statusCode = 400;
    throw error;
  }

  if (!["income", "expense"].includes(data.type)) {
    const error = new Error("Type must be either income or expense");
    error.statusCode = 400;
    throw error;
  }

  if (!data.transaction_date) {
    const error = new Error("Tanggal transaksi wajib diisi");
    error.statusCode = 400;
    throw error;
  }

  if (!data.category_id) {
    const error = new Error("Kategori wajib dipilih");
    error.statusCode = 400;
    throw error;
  }

  // 1. Ambil data kategori utama
  const primaryCategory = await categoryRepository.findCategoryById(data.category_id, data.user_id);
  if (!primaryCategory) {
    const error = new Error("Kategori tidak ditemukan");
    error.statusCode = 404;
    throw error;
  }

  // Tentukan akun simpanan dari kategori utama atau payload
  const resolvedAccountId = data.account_id ? Number(data.account_id) : (primaryCategory.account_id ? Number(primaryCategory.account_id) : null);

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Simpan data transaksi utama
    const transactionData = {
      title: data.title.trim(),
      amount: amount,
      type: data.type,
      category_id: Number(data.category_id),
      account_id: resolvedAccountId,
      allocation_id: null,
      description: data.description ? String(data.description).trim() : null,
      transaction_date: data.transaction_date,
      user_id: data.user_id,
    };

    const createdTx = await transactionRepository.createTransaction(transactionData, client);

    if (data.type === "income") {
      // 1. Akun fisik otomatis bertambah nominal penuh uang masuk
      if (resolvedAccountId) {
        await accountRepository.updateAccountBalance(resolvedAccountId, amount, client);
      }

      // 2. Alokasikan ke kategori-kategori
      const allocations = Array.isArray(data.allocations) ? data.allocations : [];
      let totalAllocated = 0;

      for (const item of allocations) {
        const itemAmount = Number(item.amount) || 0;
        if (itemAmount > 0 && item.category_id) {
          totalAllocated += itemAmount;
          await categoryRepository.updateCategoryBalance(item.category_id, itemAmount, client);
        }
      }

      // Sisa uang masuk yang belum dialokasikan secara spesifik dimasukkan ke kategori utama
      const remainingAmount = amount - totalAllocated;
      if (remainingAmount > 0) {
        await categoryRepository.updateCategoryBalance(primaryCategory.id, remainingAmount, client);
      }
    } else if (data.type === "expense") {
      // Uang keluar memotong saldo akun fisik dan kategori terkait
      if (resolvedAccountId) {
        await accountRepository.updateAccountBalance(resolvedAccountId, -amount, client);
      }
      await categoryRepository.updateCategoryBalance(primaryCategory.id, -amount, client);
    }

    await client.query("COMMIT");
    return createdTx;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

const updateTransaction = async (id, userId, data) => {
  if (!id || isNaN(id)) {
    const error = new Error("Invalid transaction ID");
    error.statusCode = 400;
    throw error;
  }

  const existingTransaction = await transactionRepository.findTransactionById(id, userId);
  if (!existingTransaction) {
    const error = new Error("Transaction not found");
    error.statusCode = 404;
    throw error;
  }

  const title = data.title !== undefined ? data.title : existingTransaction.title;
  const amount = data.amount !== undefined ? Number(data.amount) : Number(existingTransaction.amount);
  const type = data.type !== undefined ? data.type : existingTransaction.type;
  const categoryId = data.category_id !== undefined ? Number(data.category_id) : existingTransaction.category_id;

  let accountId = data.account_id !== undefined ? (data.account_id ? Number(data.account_id) : null) : existingTransaction.account_id;
  if (categoryId && !data.account_id) {
    const cat = await categoryRepository.findCategoryById(categoryId, userId);
    if (cat && cat.account_id) {
      accountId = Number(cat.account_id);
    }
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Revert efek lama
    const oldAmount = Number(existingTransaction.amount);
    if (existingTransaction.type === "income") {
      if (existingTransaction.account_id) {
        await accountRepository.updateAccountBalance(existingTransaction.account_id, -oldAmount, client);
      }
      if (existingTransaction.category_id) {
        await categoryRepository.updateCategoryBalance(existingTransaction.category_id, -oldAmount, client);
      }
    } else if (existingTransaction.type === "expense") {
      if (existingTransaction.account_id) {
        await accountRepository.updateAccountBalance(existingTransaction.account_id, oldAmount, client);
      }
      if (existingTransaction.category_id) {
        await categoryRepository.updateCategoryBalance(existingTransaction.category_id, oldAmount, client);
      }
    }

    // Update data transaksi
    const updateData = {
      title: title.trim(),
      amount: amount,
      type: type,
      category_id: categoryId,
      account_id: accountId,
      allocation_id: null,
      description: data.description !== undefined ? (data.description ? String(data.description).trim() : null) : existingTransaction.description,
      transaction_date: data.transaction_date || existingTransaction.transaction_date,
    };

    const updatedTx = await transactionRepository.updateTransaction(id, userId, updateData, client);

    // Terapkan efek baru
    if (type === "income") {
      if (accountId) {
        await accountRepository.updateAccountBalance(accountId, amount, client);
      }
      if (categoryId) {
        await categoryRepository.updateCategoryBalance(categoryId, amount, client);
      }
    } else if (type === "expense") {
      if (accountId) {
        await accountRepository.updateAccountBalance(accountId, -amount, client);
      }
      if (categoryId) {
        await categoryRepository.updateCategoryBalance(categoryId, -amount, client);
      }
    }

    await client.query("COMMIT");
    return updatedTx;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

const deleteTransaction = async (id, userId) => {
  if (!id || isNaN(id)) {
    const error = new Error("Invalid transaction ID");
    error.statusCode = 400;
    throw error;
  }

  const existingTransaction = await transactionRepository.findTransactionById(id, userId);
  if (!existingTransaction) {
    const error = new Error("Transaction not found");
    error.statusCode = 404;
    throw error;
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const amount = Number(existingTransaction.amount);
    if (existingTransaction.type === "income") {
      if (existingTransaction.account_id) {
        await accountRepository.updateAccountBalance(existingTransaction.account_id, -amount, client);
      }
      if (existingTransaction.category_id) {
        await categoryRepository.updateCategoryBalance(existingTransaction.category_id, -amount, client);
      }
    } else if (existingTransaction.type === "expense") {
      if (existingTransaction.account_id) {
        await accountRepository.updateAccountBalance(existingTransaction.account_id, amount, client);
      }
      if (existingTransaction.category_id) {
        await categoryRepository.updateCategoryBalance(existingTransaction.category_id, amount, client);
      }
    }

    const deleted = await transactionRepository.deleteTransaction(id, userId, client);
    await client.query("COMMIT");
    return deleted;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

module.exports = {
  getAllTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
};
