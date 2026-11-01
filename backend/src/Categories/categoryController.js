const categoryService = require("./categoryService");

const getCategories = async (req, res) => {
  try {
    const userId = req.query.userId || null;
    const categories = await categoryService.getAllCategories(userId);
    res.status(200).json({
      success: true,
      message: "Categories fetched successfully",
      data: categories,
    });
  } catch (error) {
    console.error("[ERROR]", error.message);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to fetch categories",
    });
  }
};

const getCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.query.userId || null;
    const category = await categoryService.getCategoryById(id, userId);
    res.status(200).json({
      success: true,
      message: "Category fetched successfully",
      data: category,
    });
  } catch (error) {
    console.error("[ERROR]", error.message);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to fetch category",
    });
  }
};

const createCategory = async (req, res) => {
  try {
    const category = await categoryService.createCategory(req.body);
    res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: category,
    });
  } catch (error) {
    console.error("[ERROR]", error.message);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to create category",
    });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.query.userId || req.body.user_id || null;
    const category = await categoryService.updateCategory(id, userId, req.body);
    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: category,
    });
  } catch (error) {
    console.error("[ERROR]", error.message);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to update category",
    });
  }
};

const patchCategory = async (req, res) => {
  return updateCategory(req, res);
};

const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.query.userId || null;
    await categoryService.deleteCategory(id, userId);
    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error("[ERROR]", error.message);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to delete category",
    });
  }
};

module.exports = {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  patchCategory,
  deleteCategory,
};
