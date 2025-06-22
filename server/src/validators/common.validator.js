const { query } = require("express-validator");

const validateOptionalUserId = [
  query("user_id")
    .optional()
    .trim()
    .isUUID()
    .withMessage("Invalid user_id format (must be UUID)"),
];

module.exports = { validateOptionalUserId };
