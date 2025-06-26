const { body } = require("express-validator");

const validateRegistration = [
  body("user_id")
    .notEmpty()
    .withMessage("UserId is required")
    .isUUID()
    .withMessage("UserId must be a UUID"),

  body("email")
    .isEmail()
    .withMessage("Email must be valid")
    .notEmpty()
    .withMessage("Email is required"),

  body("name")
    .notEmpty()
    .withMessage("Name is required")
    .isString()
    .withMessage("Name must be a string"),

  body("phone")
    .notEmpty()
    .withMessage("Phone Number is required")
    .isMobilePhone()
    .withMessage("Phone Number must be valid"),
];

const validateUpdateUser = [
  body("name").optional().isString().withMessage("Name must be a string"),

  body("profile_pic")
    .optional()
    .isString()
    .withMessage("Profile Pic must be a string"),

  body("phone")
    .optional()
    .isMobilePhone()
    .withMessage("Phone Number must be valid"),
];

module.exports = {
  validateRegistration,
  validateUpdateUser,
};
