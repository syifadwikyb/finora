const pool = require("../config/db");

const findAllCategories = async (userId) => {
  const query = `
    SELECT 
      c.id,
      c.name,
      c.account_id,
      c.current_balance::numeric,
      c.user_id,
      CASE 
        WHEN a.id IS NOT NULL THEN json_build_object(
          'id', a.id,
          'name', a.name,
          'type', a.type,
          'account_number', a.account_number,
          'current_balance', a.current_balance::numeric
        )
        ELSE NULL
      END as account
    FROM categories c
    LEFT JOIN accounts a ON c.account_id = a.id
    WHERE c.user_id = $1 OR c.user_id IS NULL
    ORDER BY c.id ASC
  `;
  const { rows } = await pool.query(query, [userId || ""]);
  return rows;
};

const findCategoryById = async (id, userId) => {
  const query = `
    SELECT 
      c.id,
      c.name,
      c.account_id,
      c.current_balance::numeric,
      c.user_id,
      CASE 
        WHEN a.id IS NOT NULL THEN json_build_object(
          'id', a.id,
          'name', a.name,
          'type', a.type,
          'account_number', a.account_number,
          'current_balance', a.current_balance::numeric
        )
        ELSE NULL
      END as account
    FROM categories c
    LEFT JOIN accounts a ON c.account_id = a.id
    WHERE c.id = $1 AND (c.user_id = $2 OR c.user_id IS NULL)
  `;
  const { rows } = await pool.query(query, [id, userId || ""]);
  return rows[0] || null;
};

const createCategory = async (categoryData) => {
  const query = `
    INSERT INTO categories (name, user_id, account_id, current_balance)
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `;
  const { rows } = await pool.query(query, [
    categoryData.name,
    categoryData.user_id || null,
    categoryData.account_id || null,
    categoryData.current_balance || 0,
  ]);
  return rows[0];
};

const updateCategory = async (id, userId, categoryData) => {
  const query = `
    UPDATE categories
    SET name = COALESCE($1, name),
        account_id = $2
    WHERE id = $3 AND (user_id = $4 OR user_id IS NULL)
    RETURNING *
  `;
  const params = [
    categoryData.name,
    categoryData.account_id !== undefined ? categoryData.account_id : null,
    id,
    userId || "",
  ];
  const { rows } = await pool.query(query, params);
  return rows[0] || null;
};

const updateCategoryBalance = async (id, amountDelta, client = pool) => {
  const query = `
    UPDATE categories
    SET current_balance = current_balance + $1
    WHERE id = $2
    RETURNING *
  `;
  const { rows } = await client.query(query, [amountDelta, id]);
  return rows[0] || null;
};

const deleteCategory = async (id, userId) => {
  const query = "DELETE FROM categories WHERE id = $1 AND (user_id = $2 OR user_id IS NULL) RETURNING *";
  const { rows } = await pool.query(query, [id, userId || ""]);
  return rows[0] || null;
};

const countTransactionsByCategoryId = async (categoryId, userId) => {
  const query = "SELECT COUNT(*)::int as count FROM transactions WHERE category_id = $1 AND user_id = $2";
  const { rows } = await pool.query(query, [categoryId, userId || ""]);
  return rows[0]?.count || 0;
};

module.exports = {
  findAllCategories,
  findCategoryById,
  createCategory,
  updateCategory,
  updateCategoryBalance,
  deleteCategory,
  countTransactionsByCategoryId,
};
