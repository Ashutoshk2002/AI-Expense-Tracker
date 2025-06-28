const { Expense, Category } = require("../models");
const { matchedData } = require("express-validator");
const { ApiResponse } = require("../utils/ApiResponse");
const { ApiError } = require("../utils/ApiError");
const { handleControllerError } = require("../helper/handleControllerError");

// Utility function to find expense by ID
const findExpenseById = async (expense_id, user_id) => {
  if (!expense_id) throw new ApiError(400, "Expense ID is required");
  const expense = await Expense.findOne({
    where: {
      expense_id,
      user_id,
    },
  });
  if (!expense) throw new ApiError(404, "Expense not found");
  return expense;
};

// Create Expense
const createExpenseController = async (req, res) => {
  try {
    const user_id = req.query.user_id;
    const expenseData = matchedData(req);

    const category = await Category.findOne({
      where: {
        category_id: expenseData.category_id,
      },
    });

    if (!category) {
      throw new ApiError(404, "Category not found");
    }
    const newExpense = await Expense.create({ user_id, ...expenseData });
    return res
      .status(201)
      .json(new ApiResponse(201, newExpense, "Expense created successfully!"));
  } catch (error) {
    handleControllerError(res, error, "creating expense");
  }
};

// Get Expense by ID
const getExpenseByIdController = async (req, res) => {
  try {
    const user_id = req.query.user_id;
    const { expense_id } = req.params;

    const expense = await Expense.findOne({
      where: {
        expense_id,
        user_id,
      },
      include: [
        {
          association: "category",
          attributes: ["name", "icon", "description"],
        },
        {
          association: "receipt",
          attributes: [
            "receipt_id",
            "s3_key",
            "processing_status",
            "extracted_text",
          ],
        },
      ],
    });

    if (!expense) {
      return res
        .status(200)
        .json(new ApiResponse(200, expense, "Expense not found"));
    }
    return res
      .status(200)
      .json(new ApiResponse(200, expense, "Expense found successfully!"));
  } catch (error) {
    handleControllerError(res, error, "fetching expense");
  }
};

// Get All Expenses
const getAllExpensesController = async (req, res) => {
  try {
    const user_id = req.query.user_id;

    const expenses = await Expense.findAll({
      where: { user_id },
      include: [
        {
          association: "category",
          attributes: ["name", "icon", "description"],
        },
        {
          association: "receipt",
          attributes: ["receipt_id", "s3_key", "processing_status"],
        },
      ],
    });
    if (!expenses) {
      return res
        .status(200)
        .json(new ApiResponse(200, expenses, "Expenses not found"));
    }
    return res
      .status(200)
      .json(new ApiResponse(200, expenses, "Expenses fetched successfully!"));
  } catch (error) {
    handleControllerError(res, error, "fetching expenses");
  }
};

// Update Expense
const updateExpenseController = async (req, res) => {
  try {
    const user_id = req.query.user_id;
    const expense_id = req.params.expense_id;

    const expense = await findExpenseById(expense_id, user_id);
    const expenseData = matchedData(req);
    await expense.update(expenseData);
    return res
      .status(200)
      .json(new ApiResponse(200, expense, "Expense updated successfully!"));
  } catch (error) {
    handleControllerError(res, error, "updating expense");
  }
};

// Delete Expense
const deleteExpenseController = async (req, res) => {
  try {
    const user_id = req.query.user_id;
    const expense_id = req.params.expense_id;

    const expense = await findExpenseById(expense_id, user_id);
    await expense.destroy();
    return res
      .status(200)
      .json(new ApiResponse(200, null, "Expense deleted successfully!"));
  } catch (error) {
    handleControllerError(res, error, "deleting expense");
  }
};

module.exports = {
  createExpenseController,
  getExpenseByIdController,
  getAllExpensesController,
  updateExpenseController,
  deleteExpenseController,
};
