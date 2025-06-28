const { body, query } = require("express-validator");
const { BUDGET_PERIOD } = require("../constants/enum");

const validateBudget = [
  query("user_id")
    .notEmpty()
    .isUUID()
    .withMessage("user_id must be a valid UUID"),

  body("name")
    .notEmpty()
    .withMessage("Budget name is required")
    .isString()
    .withMessage("Budget name must be a string")
    .isLength({ max: 100 })
    .withMessage("Budget name must be at most 100 characters"),

  body("amount_limit")
    .notEmpty()
    .withMessage("Amount limit is required")
    .isFloat({ min: 0 })
    .withMessage("Amount limit must be a positive number"),

  body("category_id")
    .optional()
    .isUUID()
    .withMessage("Category ID must be a valid UUID"),

  body("budget_period")
    .notEmpty()
    .withMessage("Budget period is required")
    .isIn(Object.values(BUDGET_PERIOD))
    .withMessage(
      `Budget period must be one of: ${Object.values(BUDGET_PERIOD).join(", ")}`
    ),

  body("period_start")
    .notEmpty()
    .withMessage("Period start is required")
    .isISO8601()
    .withMessage("Period start must be a valid date"),

  body("is_active")
    .optional()
    .isBoolean()
    .withMessage("is_active must be a boolean"),
];

const validateUpdateBudget = [
  query("user_id")
    .notEmpty()
    .isUUID()
    .withMessage("user_id must be a valid UUID"),

  body("name")
    .optional()
    .isString()
    .withMessage("Budget name must be a string")
    .isLength({ max: 100 })
    .withMessage("Budget name must be at most 100 characters"),

  body("amount_limit")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Amount limit must be a positive number"),

  body("category_id")
    .optional()
    .isUUID()
    .withMessage("Category ID must be a valid UUID"),

  body("budget_period")
    .optional()
    .isIn(Object.values(BUDGET_PERIOD))
    .withMessage(
      `Budget period must be one of: ${Object.values(BUDGET_PERIOD).join(", ")}`
    ),

  body("period_start")
    .optional()
    .isISO8601()
    .withMessage("Period start must be a valid date"),

  body("is_active")
    .optional()
    .isBoolean()
    .withMessage("is_active must be a boolean"),
];

module.exports = {
  validateBudget,
  validateUpdateBudget,
};
