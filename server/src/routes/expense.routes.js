const express = require("express");
const router = express.Router();
const expenseController = require("../controller/expense.controller");
const expenseValidator = require("../validators/expense.validator");
const { validateRequest, verifyToken } = require("../middleware");

const validateExpenseChain = [
  expenseValidator.validateExpense,
  validateRequest,
];
const validateExpenseUpdateChain = [
  expenseValidator.validateUpdateExpense,
  validateRequest,
];

// Create expense
router
  .route("/")
  .post(
    verifyToken,
    validateExpenseChain,
    expenseController.createExpenseController
  );

// Get expense by id
router
  .route("/:expense_id")
  .get(verifyToken, expenseController.getExpenseByIdController);

// Get all expenses
router.route("/").get(verifyToken, expenseController.getAllExpensesController);

// Update expense by id
router
  .route("/:expense_id")
  .patch(
    verifyToken,
    validateExpenseUpdateChain,
    expenseController.updateExpenseController
  );

// Delete expense by id
router
  .route("/:expense_id")
  .delete(verifyToken, expenseController.deleteExpenseController);

module.exports = router;
