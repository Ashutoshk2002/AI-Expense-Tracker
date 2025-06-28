const express = require("express");
const router = express.Router();
const categoryController = require("../controller/category.controller");
const categoryValidator = require("../validators/category.validator");
const { validateRequest } = require("../middleware");

const validateExpenseChain = [
  categoryValidator.validateCategory,
  validateRequest,
];
const validateExpenseUpdateChain = [
  categoryValidator.validateUpdateCategory,
  validateRequest,
];
// Create category
router
  .route("/")
  .post(validateExpenseChain, categoryController.createCategoryController);

// Get all categories
router.route("/").get(categoryController.getAllCategoriesController);

// Update category by id
router
  .route("/:category_id")
  .patch(
    validateExpenseUpdateChain,
    categoryController.updateCategoryController
  );

// Delete category by id
router
  .route("/:category_id")
  .delete(categoryController.deleteCategoryController);

module.exports = router;
