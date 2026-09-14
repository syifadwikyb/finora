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

  // Query transactions with joined category object
  let dataQuery = `
    SELECT 
      t.id,
      t.title,
      t.amount::numeric as amount,
      t.type,
      t.category_id,
      t.description,
      t.transaction_date,
      t.created_at,
      CASE 
        WHEN c.id IS NOT NULL THEN json_build_object('id', c.id, 'name', c.name)
        ELSE NULL
      END as categories
    FROM transactions t
    LEFT JOIN categories c ON t.category_id = c.id
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

const findTransactionById = async (id, userId) => {
  const query = `
    SELECT 
      t.id,
      t.title,
      t.amount::numeric as amount,
      t.type,
      t.category_id,
      t.description,
      t.transaction_date,
      t.created_at,
      CASE 
        WHEN c.id IS NOT NULL THEN json_build_object('id', c.id, 'name', c.name)
        ELSE NULL
      END as categories
    FROM transactions t
    LEFT JOIN categories c ON t.category_id = c.id
    WHERE t.id = $1 AND t.user_id = $2
  `;
  const { rows } = await pool.query(query, [id, userId]);
  return rows[0] || null;
};

const createTransaction = async (data) => {
  const insertQuery = `
    INSERT INTO transactions (title, amount, type, category_id, description, transaction_date, user_id)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING id
  `;
  const values = [
    data.title,
    data.amount,
    data.type,
    data.category_id,
    data.description || null,
    data.transaction_date,
    data.user_id, // Pastikan baris ini ada di urutan ke-7 untuk mengisi $7
  ];

  const { rows } = await pool.query(insertQuery, values);
  return await findTransactionById(rows[0].id, data.user_id);
};

const updateTransaction = async (id, userId, data) => {
  const updateQuery = `
    UPDATE transactions
    SET title = $1, amount = $2, type = $3, category_id = $4, description = $5, transaction_date = $6
    WHERE id = $7 AND user_id = $8
    RETURNING id
  `;
  const values = [
    data.title,
    data.amount,
    data.type,
    data.category_id,
    data.description || null,
    data.transaction_date,
    id,     // Menggunakan parameter id dari argumen fungsi ($7)
    userId, // Menggunakan parameter userId dari argumen fungsi ($8)
  ];
  await pool.query(updateQuery, values);
  return await findTransactionById(id, userId);
};

const deleteTransaction = async (id, userId) => {
  const query = "DELETE FROM transactions WHERE id = $1 AND user_id = $2 RETURNING *";
  const { rows } = await pool.query(query, [id, userId]);
  return rows[0] || null;
};

module.exports = {
  findAllTransactions,
  findTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
};
