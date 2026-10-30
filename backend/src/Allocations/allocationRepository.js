const pool = require("../config/db");

const findAllAllocations = async (userId, accountId = null) => {
  let query = `
    SELECT 
      al.*,
      json_build_object(
        'id', a.id,
        'name', a.name,
        'type', a.type,
        'current_balance', a.current_balance::numeric
      ) as account
    FROM allocations al
    JOIN accounts a ON al.account_id = a.id
    WHERE al.user_id = $1
  `;
  const params = [userId];

  if (accountId) {
    params.push(accountId);
    query += ` AND al.account_id = $${params.length}`;
  }

  query += ` ORDER BY al.id ASC`;
  const { rows } = await pool.query(query, params);
  return rows;
};

const findAllocationById = async (id, userId) => {
  const query = `
    SELECT 
      al.*,
      json_build_object(
        'id', a.id,
        'name', a.name,
        'type', a.type,
        'current_balance', a.current_balance::numeric
      ) as account
    FROM allocations al
    JOIN accounts a ON al.account_id = a.id
    WHERE al.id = $1 AND al.user_id = $2
  `;
  const { rows } = await pool.query(query, [id, userId]);
  return rows[0] || null;
};

const createAllocation = async (data) => {
  const query = `
    INSERT INTO allocations (user_id, account_id, name, target_amount, current_balance)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id
  `;
  const values = [
    data.user_id,
    data.account_id,
    data.name,
    data.target_amount || 0,
    data.current_balance || 0,
  ];
  const { rows } = await pool.query(query, values);
  return await findAllocationById(rows[0].id, data.user_id);
};

const updateAllocation = async (id, userId, data) => {
  const query = `
    UPDATE allocations
    SET name = COALESCE($1, name),
        account_id = COALESCE($2, account_id),
        target_amount = COALESCE($3, target_amount),
        updated_at = NOW()
    WHERE id = $4 AND user_id = $5
    RETURNING id
  `;
  const values = [
    data.name,
    data.account_id,
    data.target_amount,
    id,
    userId,
  ];
  const { rows } = await pool.query(query, values);
  if (!rows[0]) return null;
  return await findAllocationById(id, userId);
};

const updateAllocationBalance = async (id, amountDelta, client = pool) => {
  const query = `
    UPDATE allocations
    SET current_balance = current_balance + $1,
        updated_at = NOW()
    WHERE id = $2
    RETURNING *
  `;
  const { rows } = await client.query(query, [amountDelta, id]);
  return rows[0] || null;
};

const deleteAllocation = async (id, userId) => {
  const query = "DELETE FROM allocations WHERE id = $1 AND user_id = $2 RETURNING *";
  const { rows } = await pool.query(query, [id, userId]);
  return rows[0] || null;
};

module.exports = {
  findAllAllocations,
  findAllocationById,
  createAllocation,
  updateAllocation,
  updateAllocationBalance,
  deleteAllocation,
};

