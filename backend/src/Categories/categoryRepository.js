const pool = require("../config/db");

const findAllCategories = async () => {
  const query = "SELECT * FROM categories ORDER BY id ASC";
  const { rows } = await pool.query(query);
  return rows;
};

const findCategoryById = async (id) => {
  const query = "SELECT * FROM categories WHERE id = $1";
  const { rows } = await pool.query(query, [id]);
  return rows[0] || null;
};

const createCategory = async (categoryData) => {
  const query = "INSERT INTO categories (name) VALUES ($1) RETURNING *";
  const { rows } = await pool.query(query, [categoryData.name]);
  return rows[0];
};

const updateCategory = async (id, categoryData) => {
  const query = "UPDATE categories SET name = $1 WHERE id = $2 RETURNING *";
  const { rows } = await pool.query(query, [categoryData.name, id]);
  return rows[0];
};

const deleteCategory = async (id) => {
  const query = "DELETE FROM categories WHERE id = $1 RETURNING *";
  const { rows } = await pool.query(query, [id]);
  return rows[0];
};

const countTransactionsByCategoryId = async (categoryId) => {
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
