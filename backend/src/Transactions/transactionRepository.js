const pool = require("../config/db");

const findAllTransactions = async (userId, filters = {}) => {
  const conditions = ["t.user_id = $1"];
  const params = [userId];

  if (filters.type) {
    params.push(filters.type);
    conditions.push(`t.type = $${params.length}`);
  }

  if (filters.category_id) {
    params.push(filters.category_id);
    conditions.push(`t.category_id = $${params.length}`);
  }

  if (filters.account_id) {
    params.push(filters.account_id);
    conditions.push(`t.account_id = $${params.length}`);
  }

  if (filters.allocation_id) {
    params.push(filters.allocation_id);
    conditions.push(`t.allocation_id = $${params.length}`);
  }

  if (filters.date) {
    params.push(filters.date);
    conditions.push(`t.transaction_date = $${params.length}`);
  }

  if (filters.start_date) {
    params.push(filters.start_date);
    conditions.push(`t.transaction_date >= $${params.length}`);
  }

  if (filters.end_date) {
    params.push(filters.end_date);
    conditions.push(`t.transaction_date <= $${params.length}`);
  }

  if (filters.search) {
    params.push(`%${filters.search}%`);
    conditions.push(`t.title ILIKE $${params.length}`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  // Count total matching transactions
  const countQuery = `SELECT COUNT(*)::int as total FROM transactions t ${whereClause}`;
  const countRes = await pool.query(countQuery, params);
  const total = countRes.rows[0]?.total || 0;

  // Query transactions with joined category, account, and allocation
  let dataQuery = `
    SELECT 
      t.id,
      t.title,
      t.amount::numeric as amount,
      t.type,
      t.category_id,
      t.account_id,
      t.allocation_id,
      t.description,
      t.transaction_date,
      t.created_at,
      CASE 
        WHEN c.id IS NOT NULL THEN json_build_object('id', c.id, 'name', c.name)
        ELSE NULL
      END as categories,
      CASE 
        WHEN a.id IS NOT NULL THEN json_build_object('id', a.id, 'name', a.name, 'type', a.type)
        ELSE NULL
      END as account,
      CASE 
        WHEN al.id IS NOT NULL THEN json_build_object('id', al.id, 'name', al.name, 'current_balance', al.current_balance::numeric, 'target_amount', al.target_amount::numeric)
        ELSE NULL
      END as allocation
    FROM transactions t
    LEFT JOIN categories c ON t.category_id = c.id
    LEFT JOIN accounts a ON t.account_id = a.id
    LEFT JOIN allocations al ON t.allocation_id = al.id
    ${whereClause}
    ORDER BY t.transaction_date DESC, t.id DESC
  `;

  const queryParams = [...params];
  if (filters.page && filters.limit) {
    const pageNum = parseInt(filters.page, 10);
    const limitNum = parseInt(filters.limit, 10);
    const offset = (pageNum - 1) * limitNum;
    queryParams.push(limitNum);
    dataQuery += ` LIMIT $${queryParams.length}`;
    queryParams.push(offset);
    dataQuery += ` OFFSET $${queryParams.length}`;
  }

  const { rows } = await pool.query(dataQuery, queryParams);

  return {
    transactions: rows,
    total,
  };
};

const findTransactionById = async (id, userId, client = pool) => {
  const query = `
    SELECT 
      t.id,
      t.title,
      t.amount::numeric as amount,
      t.type,
      t.category_id,
      t.account_id,
      t.allocation_id,
      t.description,
      t.transaction_date,
      t.created_at,
      CASE 
        WHEN c.id IS NOT NULL THEN json_build_object('id', c.id, 'name', c.name)
        ELSE NULL
      END as categories,
      CASE 
        WHEN a.id IS NOT NULL THEN json_build_object('id', a.id, 'name', a.name, 'type', a.type)
        ELSE NULL
      END as account,
      CASE 
        WHEN al.id IS NOT NULL THEN json_build_object('id', al.id, 'name', al.name, 'current_balance', al.current_balance::numeric, 'target_amount', al.target_amount::numeric)
        ELSE NULL
      END as allocation
    FROM transactions t
    LEFT JOIN categories c ON t.category_id = c.id
    LEFT JOIN accounts a ON t.account_id = a.id
    LEFT JOIN allocations al ON t.allocation_id = al.id
    WHERE t.id = $1 AND t.user_id = $2
  `;
  const { rows } = await client.query(query, [id, userId]);
  return rows[0] || null;
};

const createTransaction = async (data, client = pool) => {
  const insertQuery = `
    INSERT INTO transactions (title, amount, type, category_id, account_id, allocation_id, description, transaction_date, user_id)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING id
  `;
  const values = [
    data.title,
    data.amount,
    data.type,
    data.category_id || null,
    data.account_id || null,
    data.allocation_id || null,
    data.description || null,
    data.transaction_date,
    data.user_id,
  ];

  const { rows } = await client.query(insertQuery, values);
  return await findTransactionById(rows[0].id, data.user_id, client);
};

const updateTransaction = async (id, userId, data, client = pool) => {
  const updateQuery = `
    UPDATE transactions
    SET title = $1, amount = $2, type = $3, category_id = $4, account_id = $5, allocation_id = $6, description = $7, transaction_date = $8
    WHERE id = $9 AND user_id = $10
    RETURNING id
  `;
  const values = [
    data.title,
    data.amount,
    data.type,
    data.category_id || null,
    data.account_id || null,
    data.allocation_id || null,
    data.description || null,
    data.transaction_date,
    id,
    userId,
  ];
  await client.query(updateQuery, values);
  return await findTransactionById(id, userId, client);
};

const deleteTransaction = async (id, userId, client = pool) => {
  const query = "DELETE FROM transactions WHERE id = $1 AND user_id = $2 RETURNING *";
  const { rows } = await client.query(query, [id, userId]);
  return rows[0] || null;
};

module.exports = {
  findAllTransactions,
  findTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
};
