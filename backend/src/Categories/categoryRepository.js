const pool = require("../config/db");

const findAllCategories = async (userId) => {
  if (userId) {
    const query = "SELECT * FROM categories WHERE user_id = $1 OR user_id IS NULL ORDER BY id ASC";
    const { rows } = await pool.query(query, [userId]);
    return rows;
  }
  const query = "SELECT * FROM categories WHERE user_id IS NULL ORDER BY id ASC";
  const { rows } = await pool.query(query);
  return rows;
};

const findCategoryById = async (id, userId) => {
  if (userId) {
    const query = "SELECT * FROM categories WHERE id = $1 AND (user_id = $2 OR user_id IS NULL)";
    const { rows } = await pool.query(query, [id, userId]);
    return rows[0] || null;
  }
  const query = "SELECT * FROM categories WHERE id = $1";
  const { rows } = await pool.query(query, [id]);
  return rows[0] || null;
};

const createCategory = async (categoryData) => {
  const query = "INSERT INTO categories (name, user_id) VALUES ($1, $2) RETURNING *";
  const { rows } = await pool.query(query, [categoryData.name, categoryData.user_id || null]);
  return rows[0];
};

const updateCategory = async (id, userId, categoryData) => {
  let query, params;
  if (userId) {
    query = "UPDATE categories SET name = $1 WHERE id = $2 AND (user_id = $3 OR user_id IS NULL) RETURNING *";
    params = [categoryData.name, id, userId];
  } else {
    query = "UPDATE categories SET name = $1 WHERE id = $2 RETURNING *";
    params = [categoryData.name, id];
  }
  const { rows } = await pool.query(query, params);
  return rows[0];
};

const deleteCategory = async (id, userId) => {
  let query, params;
  if (userId) {
    query = "DELETE FROM categories WHERE id = $1 AND (user_id = $2 OR user_id IS NULL) RETURNING *";
    params = [id, userId];
  } else {
    query = "DELETE FROM categories WHERE id = $1 RETURNING *";
    params = [id];
  }
  const { rows } = await pool.query(query, params);
  return rows[0];
};

const countTransactionsByCategoryId = async (categoryId, userId) => {
  if (userId) {
    const query = "SELECT COUNT(*)::int as count FROM transactions WHERE category_id = $1 AND user_id = $2";
    const { rows } = await pool.query(query, [categoryId, userId]);
    return rows[0]?.count || 0;
  }
  const query = "SELECT COUNT(*)::int as count FROM transactions WHERE category_id = $1";
  const { rows } = await pool.query(query, [categoryId]);
  return rows[0]?.count || 0;
};

module.exports = {
  findAllCategories,
  findCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  countTransactionsByCategoryId,
};
