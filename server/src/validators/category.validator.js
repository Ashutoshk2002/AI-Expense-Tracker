const { body } = require("express-validator");

const validateCategory = [
  body("name")
    .notEmpty()
    .withMessage("Category name is required")
    .isString()
    .withMessage("Category name must be a string")
    .isLength({ max: 100 })
    .withMessage("Category name must be at most 100 characters"),

  body("icon")
    .isString()
    .withMessage("Icon must be a string")
    .isLength({ max: 50 })
    .withMessage("Icon must be at most 50 characters"),
];

const validateUpdateCategory = [
  body("name")
    .optional()
    .isString()
    .withMessage("Category name must be a string")
    .isLength({ max: 100 })
    .withMessage("Category name must be at most 100 characters"),

  body("icon")
    .optional()
    .isString()
    .withMessage("Icon must be a string")
    .isLength({ max: 50 })
    .withMessage("Icon must be at most 50 characters"),
];

module.exports = {
  validateCategory,
  validateUpdateCategory,
};
