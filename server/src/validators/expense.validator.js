const { body, query } = require("express-validator");
const { EXPENSE_STATUS, PAYMENT_METHOD } = require("../constants/enum");

const validateExpense = [
  query("user_id")
    .notEmpty()
    .isUUID()
    .withMessage("user_id must be a valid UUID"),

  body("category_id")
    .notEmpty()
    .withMessage("Category ID is required")
    .isUUID()
    .withMessage("Category ID must be a valid UUID"),

  body("amount")
    .notEmpty()
    .withMessage("Amount is required")
    .isFloat({ min: 0.01 })
    .withMessage("Amount must be a positive number"),

  body("currency")
    .optional()
    .isString()
    .isLength({ min: 3, max: 3 })
    .withMessage("Currency must be a 3-letter code"),

  body("description")
    .optional()
    .isString()
    .withMessage("Description must be a string"),

  body("merchant_name")
    .optional()
    .isString()
    .withMessage("Merchant name must be a string"),

  body("expense_date")
    .optional()
    .isISO8601()
    .withMessage("Expense date must be a valid date"),

  body("receipt_url")
    .optional()
    .isString()
    .withMessage("Receipt URL must be a string"),

  body("receipt_text")
    .optional()
    .isString()
    .withMessage("Receipt text must be a string"),

  body("payment_method")
    .optional()
    .isIn(Object.values(PAYMENT_METHOD))
    .withMessage(
      `Payment method must be one of: ${Object.values(PAYMENT_METHOD).join(
        ", "
      )}`
    ),

  body("location")
    .optional()
    .isObject()
    .withMessage("Location must be a valid object"),

  body("ai_confidence")
    .optional()
    .isFloat({ min: 0, max: 1 })
    .withMessage("AI confidence must be between 0 and 1"),

  body("is_verified")
    .optional()
    .isBoolean()
    .withMessage("is_verified must be a boolean"),

  body("notes").optional().isString().withMessage("Notes must be a string"),

  body("status")
    .optional()
    .isIn(Object.values(EXPENSE_STATUS))
    .withMessage(
      `Status must be one of: ${Object.values(EXPENSE_STATUS).join(", ")}`
    ),
];

const validateUpdateExpense = [
  query("user_id")
    .notEmpty()
    .isUUID()
    .withMessage("user_id must be a valid UUID"),

  body("category_id")
    .optional()
    .isUUID()
    .withMessage("Category ID must be a valid UUID"),

  body("amount")
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage("Amount must be a positive number"),

  body("currency")
    .optional()
    .isString()
    .isLength({ min: 3, max: 3 })
    .withMessage("Currency must be a 3-letter code"),

  body("description")
    .optional()
    .isString()
    .withMessage("Description must be a string"),

  body("merchant_name")
    .optional()
    .isString()
    .withMessage("Merchant name must be a string"),

  body("expense_date")
    .optional()
    .isISO8601()
    .withMessage("Expense date must be a valid date"),

  body("receipt_url")
    .optional()
    .isString()
    .withMessage("Receipt URL must be a string"),

  body("receipt_text")
    .optional()
    .isString()
    .withMessage("Receipt text must be a string"),

  body("payment_method")
    .optional()
    .isIn(Object.values(PAYMENT_METHOD))
    .withMessage(
      `Payment method must be one of: ${Object.values(PAYMENT_METHOD).join(
        ", "
      )}`
    ),

  body("location")
    .optional()
    .isObject()
    .withMessage("Location must be a valid object"),

  body("ai_confidence")
    .optional()
    .isFloat({ min: 0, max: 1 })
    .withMessage("AI confidence must be between 0 and 1"),

  body("is_verified")
    .optional()
    .isBoolean()
    .withMessage("is_verified must be a boolean"),

  body("notes").optional().isString().withMessage("Notes must be a string"),

  body("status")
    .optional()
    .isIn(Object.values(EXPENSE_STATUS))
    .withMessage(
      `Status must be one of: ${Object.values(EXPENSE_STATUS).join(", ")}`
    ),
];

module.exports = {
  validateExpense,
  validateUpdateExpense,
};
