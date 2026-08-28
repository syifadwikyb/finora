const categoryService = require("./categoryService");

const getCategories = async (req, res) => {
  try {
    const categories = await categoryService.getAllCategories();
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
    const category = await categoryService.getCategoryById(id);
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
    const category = await categoryService.updateCategory(id, req.body);
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
    await categoryService.deleteCategory(id);
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
