const express = require("express");
const router = express.Router();
const budgetController = require("../controller/budget.controller");
const budgetValidator = require("../validators/budget.validator");
const { validateRequest } = require("../middleware");

const validateBudgetChain = [budgetValidator.validateBudget, validateRequest];
const validateBudgetUpdateChain = [
  budgetValidator.validateUpdateBudget,
  validateRequest,
];

router
  .route("/")
  .post(validateBudgetChain, budgetController.createBudgetController)
  .get(budgetController.getAllBudgetsController);

router
  .route("/:budget_id")
  .get(budgetController.getBudgetByIdController)
  .patch(validateBudgetUpdateChain, budgetController.updateBudgetController)
  .delete(budgetController.deleteBudgetController);

module.exports = router;
module.exports = router;
