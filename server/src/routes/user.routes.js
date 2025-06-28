const router = require("express").Router();
const userController = require("../controller/user.controller.js");
const userValidator = require("../validators/user.validator.js");
const { validateRequest, verifyToken } = require("../middleware/index.js");

// Middleware chains
const validateRegistrationChain = [
  userValidator.validateRegistration,
  validateRequest,
];

const validateLoginChain = [userValidator.validateLoginUser, validateRequest];

const validateUpdateChain = [userValidator.validateUpdateUser, validateRequest];

// Register User
router
  .route("/register")
  .post(validateRegistrationChain, userController.registerController);

router.route("/login").post(validateLoginChain, userController.loginController);

// Get User by ID
router
  .route("/:user_id")
  .get(verifyToken, userController.getUserByIdController);

// Update User
router
  .route("/:user_id")
  .put(verifyToken, validateUpdateChain, userController.updateUserController);

router
  .route("/:user_id")
  .delete(verifyToken, userController.deleteUserController);

module.exports = router;
