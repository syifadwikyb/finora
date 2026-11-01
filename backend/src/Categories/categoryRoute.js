const express = require("express");
const router = express.Router();
const categoryController = require("./categoryController");

router.get("/", categoryController.getCategories);
router.get("/:id", categoryController.getCategory);
router.post("/", categoryController.createCategory);
router.put("/:id", categoryController.updateCategory);
router.patch("/:id", categoryController.patchCategory);
router.delete("/:id", categoryController.deleteCategory);

module.exports = router;
