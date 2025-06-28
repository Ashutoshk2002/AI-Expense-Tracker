const express = require("express");
const router = express.Router();
const budgetController = require("../controller/budget.controller");
const budgetValidator = require("../validators/budget.validator");
const { validateRequest, verifyToken } = require("../middleware");

const validateBudgetChain = [budgetValidator.validateBudget, validateRequest];
const validateBudgetUpdateChain = [
  budgetValidator.validateUpdateBudget,
  validateRequest,
];

router
  .route("/")
  .post(
    verifyToken,
    validateBudgetChain,
    budgetController.createBudgetController
  )
  .get(verifyToken, budgetController.getAllBudgetsController);

router
  .route("/:budget_id")
  .get(verifyToken, budgetController.getBudgetByIdController)
  .patch(
    verifyToken,
    validateBudgetUpdateChain,
    budgetController.updateBudgetController
  )
  .delete(verifyToken, budgetController.deleteBudgetController);

module.exports = router;
module.exports = router;
