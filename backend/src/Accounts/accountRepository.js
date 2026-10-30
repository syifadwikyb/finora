const pool = require("../config/db");

const findAllAccounts = async (userId) => {
  const query = `
    SELECT 
      a.*,
      COALESCE(
        (SELECT json_agg(
          json_build_object(
            'id', c.id,
            'name', c.name,
            'current_balance', c.current_balance::numeric
          )
        ) FROM categories c WHERE c.account_id = a.id),
        '[]'::json
      ) as categories
    FROM accounts a
    WHERE a.user_id = $1
    ORDER BY a.id ASC
  `;
  const { rows } = await pool.query(query, [userId]);
  return rows;
};

const findAccountById = async (id, userId) => {
  const query = `
    SELECT 
      a.*,
      COALESCE(
        (SELECT json_agg(
          json_build_object(
            'id', c.id,
            'name', c.name,
            'current_balance', c.current_balance::numeric
          )
        ) FROM categories c WHERE c.account_id = a.id),
        '[]'::json
      ) as categories
    FROM accounts a
    WHERE a.id = $1 AND a.user_id = $2
  `;
  const { rows } = await pool.query(query, [id, userId]);
  return rows[0] || null;
};

const createAccount = async (accountData) => {
  const query = `
    INSERT INTO accounts (user_id, name, type, account_number, current_balance)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `;
  const values = [
    accountData.user_id,
    accountData.name,
    accountData.type || "bank",
    accountData.account_number || null,
    accountData.current_balance || 0,
  ];
  const { rows } = await pool.query(query, values);
  return rows[0];
};

const updateAccount = async (id, userId, accountData) => {
  const query = `
    UPDATE accounts
    SET name = COALESCE($1, name),
        type = COALESCE($2, type),
        account_number = COALESCE($3, account_number),
        updated_at = NOW()
    WHERE id = $4 AND user_id = $5
    RETURNING *
  `;
  const values = [
    accountData.name,
    accountData.type,
    accountData.account_number,
    id,
    userId,
  ];
  const { rows } = await pool.query(query, values);
  return rows[0] || null;
};

const updateAccountBalance = async (id, amountDelta, client = pool) => {
  const query = `
    UPDATE accounts
    SET current_balance = current_balance + $1,
        updated_at = NOW()
    WHERE id = $2
    RETURNING *
  `;
  const { rows } = await client.query(query, [amountDelta, id]);
  return rows[0] || null;
};

const deleteAccount = async (id, userId) => {
  const query = "DELETE FROM accounts WHERE id = $1 AND user_id = $2 RETURNING *";
  const { rows } = await pool.query(query, [id, userId]);
  return rows[0] || null;
};

module.exports = {
  findAllAccounts,
  findAccountById,
  createAccount,
  updateAccount,
  updateAccountBalance,
  deleteAccount,
};
