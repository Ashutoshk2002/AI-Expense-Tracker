const { Category } = require("../models");
const { matchedData } = require("express-validator");
const { ApiResponse } = require("../utils/ApiResponse");
const { ApiError } = require("../utils/ApiError");
const { handleControllerError } = require("../helper/handleControllerError");

// Create Category
const createCategoryController = async (req, res) => {
  try {
    const categoryData = matchedData(req);
    const category = await Category.create(categoryData);
    return res
      .status(201)
      .json(new ApiResponse(201, category, "Category created successfully!"));
  } catch (error) {
    handleControllerError(res, error, "creating category");
  }
};

// Get All Categories
const getAllCategoriesController = async (req, res) => {
  try {
    const categories = await Category.findAll({
      attributes: ["category_id", "name", "icon"],
    });
    return res
      .status(200)
      .json(
        new ApiResponse(200, categories, "Categories fetched successfully!")
      );
  } catch (error) {
    handleControllerError(res, error, "fetching categories");
  }
};

// Update Category
const updateCategoryController = async (req, res) => {
  try {
    const { category_id } = req.params;
    const category = await Category.findOne({
      where: { category_id },
    });
    if (!category) throw new ApiError(404, "Category not found");
    const categoryData = matchedData(req);
    await category.update(categoryData);
    return res
      .status(200)
      .json(new ApiResponse(200, category, "Category updated successfully!"));
  } catch (error) {
    handleControllerError(res, error, "updating category");
  }
};

// Delete Category
const deleteCategoryController = async (req, res) => {
  try {
    const { category_id } = req.params;
    const category = await Category.findOne({
      where: { category_id },
    });
    if (!category) throw new ApiError(404, "Category not found");
    await category.destroy();
    return res
      .status(200)
      .json(new ApiResponse(200, null, "Category deleted successfully!"));
  } catch (error) {
    handleControllerError(res, error, "deleting category");
  }
};

module.exports = {
  createCategoryController,
  getAllCategoriesController,
  updateCategoryController,
  deleteCategoryController,
};
