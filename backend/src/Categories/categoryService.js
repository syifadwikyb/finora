const categoryRepository = require("./categoryRepository");

const getAllCategories = async () => {
  return await categoryRepository.findAllCategories();
};

const getCategoryById = async (id) => {
  if (!id || isNaN(id)) {
    const error = new Error("Invalid category ID");
    error.statusCode = 400;
    throw error;
  }

  const category = await categoryRepository.findCategoryById(id);
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
  };

  return await categoryRepository.createCategory(categoryData);
};

const updateCategory = async (id, data) => {
  if (!id || isNaN(id)) {
    const error = new Error("Invalid category ID");
    error.statusCode = 400;
    throw error;
  }

  const existingCategory = await categoryRepository.findCategoryById(id);
  if (!existingCategory) {
    const error = new Error("Category not found");
    error.statusCode = 404;
    throw error;
  }

  if (!data.name || typeof data.name !== "string" || data.name.trim() === "") {
    const error = new Error("Category name is required");
    error.statusCode = 400;
    throw error;
  }

  const categoryData = {
    name: data.name.trim(),
  };

  return await categoryRepository.updateCategory(id, categoryData);
};

const deleteCategory = async (id) => {
  if (!id || isNaN(id)) {
    const error = new Error("Invalid category ID");
    error.statusCode = 400;
    throw error;
  }

  const existingCategory = await categoryRepository.findCategoryById(id);
  if (!existingCategory) {
    const error = new Error("Category not found");
    error.statusCode = 404;
    throw error;
  }

  const transactionCount = await categoryRepository.countTransactionsByCategoryId(id);
  if (transactionCount > 0) {
    const error = new Error("Category cannot be deleted because it is being used by transactions.");
    error.statusCode = 400;
    throw error;
  }

  return await categoryRepository.deleteCategory(id);
};

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
