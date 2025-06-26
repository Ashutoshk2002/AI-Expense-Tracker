const router = require("express").Router();
const userController = require("../controller/user.controller.js");
const userValidator = require("../validators/user.validator.js");
const { validateRequest } = require("../middleware/index.js");

// Middleware chains
const validateRegistrationChain = [
  userValidator.validateRegistration,
  validateRequest,
];

const validateUpdateChain = [userValidator.validateUpdateUser, validateRequest];

// Register User
router
  .route("/register")
  .post(validateRegistrationChain, userController.registerController);

// Get User by ID
router.route("/:user_id").get(userController.getUserByIdController);

// Update User
router
  .route("/:user_id")
  .put(validateUpdateChain, userController.updateUserController);

router.route("/:user_id").delete(userController.deleteUserController);

module.exports = router;
