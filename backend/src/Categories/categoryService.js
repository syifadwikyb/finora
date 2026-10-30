const categoryRepository = require("./categoryRepository");

const getAllCategories = async (userId) => {
  return await categoryRepository.findAllCategories(userId);
};

const getCategoryById = async (id, userId) => {
  if (!id || isNaN(id)) {
    const error = new Error("Invalid category ID");
    error.statusCode = 400;
    throw error;
  }

  const category = await categoryRepository.findCategoryById(id, userId);
  if (!category) {
    const error = new Error("Category not found");
    error.statusCode = 404;
    throw error;
  }

  return category;
};

const createCategory = async (data) => {
  if (!data.name || typeof data.name !== "string" || data.name.trim() === "") {
    const error = new Error("Category name is required");
    error.statusCode = 400;
    throw error;
  }

  const categoryData = {
    name: data.name.trim(),
    user_id: data.user_id || null,
    account_id: data.account_id ? Number(data.account_id) : null,
  };

  return await categoryRepository.createCategory(categoryData);
};

const updateCategory = async (id, userId, data) => {
  if (!id || isNaN(id)) {
    const error = new Error("Invalid category ID");
    error.statusCode = 400;
    throw error;
  }

  const existingCategory = await categoryRepository.findCategoryById(id, userId);
  if (!existingCategory) {
    const error = new Error("Category not found");
    error.statusCode = 404;
    throw error;
  }

  if (data.name !== undefined && (typeof data.name !== "string" || data.name.trim() === "")) {
    const error = new Error("Category name cannot be empty");
    error.statusCode = 400;
    throw error;
  }

  const categoryData = {
    name: data.name ? data.name.trim() : undefined,
    account_id: data.account_id !== undefined ? (data.account_id ? Number(data.account_id) : null) : undefined,
  };

  return await categoryRepository.updateCategory(id, userId, categoryData);
};

const deleteCategory = async (id, userId) => {
  if (!id || isNaN(id)) {
    const error = new Error("Invalid category ID");
    error.statusCode = 400;
    throw error;
  }

  const existingCategory = await categoryRepository.findCategoryById(id, userId);
  if (!existingCategory) {
    const error = new Error("Category not found");
    error.statusCode = 404;
    throw error;
  }

  // Cek apakah kategori digunakan dalam transaksi
  const transactionCount = await categoryRepository.countTransactionsByCategoryId(id, userId);
  if (transactionCount > 0) {
    const error = new Error("Cannot delete category because it is used in transactions");
    error.statusCode = 409;
    throw error;
  }

  return await categoryRepository.deleteCategory(id, userId);
};

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
