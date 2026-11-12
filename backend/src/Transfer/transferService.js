const pool = require("../config/db");
const transferRepository = require("./transferRepository");
const categoryRepository = require("../Categories/categoryRepository");

const createHttpError = (statusCode, message) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
};

const formatRupiah = (value) => `Rp ${Number(value).toLocaleString("id-ID")}`;

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

// Kurangi saldo kategori, atau gagal dengan pesan yang jelas.
const decreaseBalance = async (client, categoryId, userId, amount, context) => {
    const updated = await categoryRepository.decreaseCategoryBalance(categoryId, amount, client);
    if (updated) return;

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

const assertValidTransferId = (transferId) => {
    const id = Number(transferId);
    if (!Number.isInteger(id) || id <= 0) {
        throw createHttpError(400, "Invalid transfer ID");
    }
    return id;
};

// Validasi yang sama untuk membuat dan mengedit transfer
const validateTransferPayload = (payload) => {
    const amount = Number(payload.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
        throw createHttpError(400, "Amount must be greater than 0");
    }

    const fromCategoryId = Number(payload.from_category_id);
    const toCategoryId = Number(payload.to_category_id);
    if (!fromCategoryId || !toCategoryId) {
        throw createHttpError(400, "Source and destination categories are required");
    }
    if (fromCategoryId === toCategoryId) {
        throw createHttpError(400, "Source and destination must be different");
    }

    if (!payload.transfer_date || !/^\d{4}-\d{2}-\d{2}$/.test(payload.transfer_date)) {
        throw createHttpError(400, "Transfer date is required");
    }

    return {
        amount,
        fromCategoryId,
        toCategoryId,
        transferDate: payload.transfer_date,
        note: payload.note ? String(payload.note).trim() : null,
    };
};

// Batalkan efek saldo transfer lama: tarik dari tujuan, kembalikan ke asal.
const reverseTransferEffect = async (client, transfer, userId, action) => {
    const amount = Number(transfer.amount);

    if (transfer.to_category_id) {
        await decreaseBalance(
            client,
            transfer.to_category_id,
            userId,
            amount,
            `${action} (the funds have already been used)`
        );
    }
    if (transfer.from_category_id) {
        await categoryRepository.updateCategoryBalance(transfer.from_category_id, amount, client);
    }
};

const createTransfer = async (payload) => {
    const userId = payload.user_id;
    if (!userId) {
        throw createHttpError(400, "User ID is required");
    }

    const { amount, fromCategoryId, toCategoryId, transferDate, note } =
        validateTransferPayload(payload);

    const [fromCategory, toCategory] = await Promise.all([
        categoryRepository.findCategoryById(fromCategoryId, userId),
        categoryRepository.findCategoryById(toCategoryId, userId),
    ]);
    if (!fromCategory || !toCategory) {
        throw createHttpError(404, "Category not found");
    }

    return runInTransaction(async (client) => {
        // 1. Take the money out of the source
        await decreaseBalance(client, fromCategory.id, userId, amount, "this transfer");

        // 2. Put it into the destination
        await categoryRepository.updateCategoryBalance(toCategory.id, amount, client);

        // 3. Keep a record of the transfer
        return transferRepository.createTransfer(
            {
                user_id: userId,
                from_category_id: fromCategory.id,
                to_category_id: toCategory.id,
                from_account_id: fromCategory.account_id || null,
                to_account_id: toCategory.account_id || null,
                amount,
                note,
                transfer_date: transferDate,
            },
            client
        );
    });
};

const getAllTransfers = async (userId) => {
    if (!userId) {
        throw createHttpError(400, "User ID is required");
    }
    return transferRepository.findAllTransfers(userId);
};

const updateTransfer = async (transferId, userId, payload) => {
    if (!userId) {
        throw createHttpError(400, "User ID is required");
    }
    const id = assertValidTransferId(transferId);

    const existing = await transferRepository.findTransferById(id, userId);
    if (!existing) {
        throw createHttpError(404, "Transfer not found");
    }

    const { amount, fromCategoryId, toCategoryId, transferDate, note } =
        validateTransferPayload(payload);

    const [fromCategory, toCategory] = await Promise.all([
        categoryRepository.findCategoryById(fromCategoryId, userId),
        categoryRepository.findCategoryById(toCategoryId, userId),
    ]);
    if (!fromCategory || !toCategory) {
        throw createHttpError(404, "Category not found");
    }

    return runInTransaction(async (client) => {
        // 1. Batalkan efek saldo transfer lama
        await reverseTransferEffect(client, existing, userId, "editing this transfer");

        // 2. Terapkan efek saldo yang baru
        await decreaseBalance(client, fromCategory.id, userId, amount, "this transfer");
        await categoryRepository.updateCategoryBalance(toCategory.id, amount, client);

        // 3. Simpan perubahan
        return transferRepository.updateTransfer(
            id,
            userId,
            {
                from_category_id: fromCategory.id,
                to_category_id: toCategory.id,
                from_account_id: fromCategory.account_id || null,
                to_account_id: toCategory.account_id || null,
                amount,
                note,
                transfer_date: transferDate,
            },
            client
        );
    });
};

const deleteTransfer = async (transferId, userId) => {
    if (!userId) {
        throw createHttpError(400, "User ID is required");
    }
    const id = assertValidTransferId(transferId);

    const existing = await transferRepository.findTransferById(id, userId);
    if (!existing) {
        throw createHttpError(404, "Transfer not found");
    }

    return runInTransaction(async (client) => {
        await reverseTransferEffect(client, existing, userId, "deleting this transfer");
        return transferRepository.deleteTransfer(id, userId, client);
    });
};

module.exports = {
    createTransfer,
    getAllTransfers,
    updateTransfer,
    deleteTransfer,
};