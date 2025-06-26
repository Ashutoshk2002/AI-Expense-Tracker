const express = require("express");
const router = express.Router();
const expenseController = require("../controller/expense.controller");
const expenseValidator = require("../validators/expense.validator");
const { validateRequest } = require("../middleware");

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
  .post(validateExpenseChain, expenseController.createExpenseController);

// Get expense by id
router.route("/:expense_id").get(expenseController.getExpenseByIdController);

// Get all expenses
router.route("/").get(expenseController.getAllExpensesController);

// Update expense by id
router
  .route("/:expense_id")
  .patch(validateExpenseUpdateChain, expenseController.updateExpenseController);

// Delete expense by id
router.route("/:expense_id").delete(expenseController.deleteExpenseController);

module.exports = router;
