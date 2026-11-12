const pool = require("../config/db");

const createTransfer = async (data, client = pool) => {
    const query = `
    INSERT INTO transfers
      (user_id, from_category_id, to_category_id, from_account_id, to_account_id, amount, note, transfer_date)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *
  `;
    const { rows } = await client.query(query, [
        data.user_id,
        data.from_category_id,
        data.to_category_id,
        data.from_account_id,
        data.to_account_id,
        data.amount,
        data.note,
        data.transfer_date,
    ]);
    return rows[0];
};

const findAllTransfers = async (userId, limit = 50) => {
    const query = `
    SELECT
      t.id,
      t.amount::numeric,
      t.note,
      t.transfer_date,
      t.created_at,
      t.from_category_id,
      t.to_category_id,
      t.from_account_id,
      t.to_account_id,
      fc.name AS from_category_name,
      tc.name AS to_category_name,
      fa.name AS from_account_name,
      ta.name AS to_account_name
    FROM transfers t
    LEFT JOIN categories fc ON fc.id = t.from_category_id
    LEFT JOIN categories tc ON tc.id = t.to_category_id
    LEFT JOIN accounts fa ON fa.id = t.from_account_id
    LEFT JOIN accounts ta ON ta.id = t.to_account_id
    WHERE t.user_id = $1
    ORDER BY t.transfer_date DESC, t.id DESC
    LIMIT $2
  `;
    const { rows } = await pool.query(query, [userId, limit]);
    return rows;
};

const findTransferById = async (id, userId, client = pool) => {
    const { rows } = await client.query(
        "SELECT * FROM transfers WHERE id = $1 AND user_id = $2",
        [id, userId]
    );
    return rows[0] || null;
};

const updateTransfer = async (id, userId, data, client = pool) => {
    const query = `
    UPDATE transfers
    SET from_category_id = $1,
        to_category_id = $2,
        from_account_id = $3,
        to_account_id = $4,
        amount = $5,
        note = $6,
        transfer_date = $7
    WHERE id = $8 AND user_id = $9
    RETURNING *
  `;
    const { rows } = await client.query(query, [
        data.from_category_id,
        data.to_category_id,
        data.from_account_id,
        data.to_account_id,
        data.amount,
        data.note,
        data.transfer_date,
        id,
        userId,
    ]);
    return rows[0] || null;
};

const deleteTransfer = async (id, userId, client = pool) => {
    const { rows } = await client.query(
        "DELETE FROM transfers WHERE id = $1 AND user_id = $2 RETURNING *",
        [id, userId]
    );
    return rows[0] || null;
};

module.exports = {
    createTransfer,
    findAllTransfers,
    findTransferById,
    updateTransfer,
    deleteTransfer,
};