const { Expense, Category, User } = require("../models");
const { matchedData } = require("express-validator");
const { ApiResponse } = require("../utils/ApiResponse");
const { ApiError } = require("../utils/ApiError");
const { handleControllerError } = require("../helper/handleControllerError");
const { sequelize } = require("../db");
const {
  findActiveBudgetsForExpense,
  updateBudgetSpent,
} = require("../helper/CommonHelper");

// Utility function to find expense by ID
const findExpenseById = async (expense_id, user_id, transaction) => {
  if (!expense_id) throw new ApiError(400, "Expense ID is required");
  const expense = await Expense.findOne({
    where: {
      expense_id,
      user_id,
    },
    transaction,
  });
  if (!expense) throw new ApiError(404, "Expense not found");
  return expense;
};

// Create Expense
const createExpenseController = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const user_id = req.user.user_id;
    const expenseData = matchedData(req);
    const { category_id, amount, expense_date } = expenseData;

    const [user, category] = await Promise.all([
      User.findByPk(user_id),
      Category.findByPk(category_id),
    ]);

    if (!user) {
      throw new ApiError(404, "User not found");
    }
    if (!category) {
      throw new ApiError(404, "Category not found");
    }

    if (!category) {
      throw new ApiError(404, "Category not found");
    }
    const newExpense = await Expense.create(
      { user_id, ...expenseData },
      { transaction }
    );
    const budgetsToUpdate = await findActiveBudgetsForExpense(
      user_id,
      category_id,
      expense_date,
      transaction
    );

    // Update budget amounts
    for (const budget of budgetsToUpdate) {
      await updateBudgetSpent(budget, amount, transaction);
    }
    await transaction.commit();

    return res
      .status(201)
      .json(new ApiResponse(201, newExpense, "Expense created successfully!"));
  } catch (error) {
    await transaction.rollback();
    handleControllerError(res, error, "creating expense");
  }
};

// Get Expense by ID
const getExpenseByIdController = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const { expense_id } = req.params;

    const expense = await Expense.findOne({
      where: {
        expense_id,
        user_id,
      },
      include: [
        {
          association: "category",
          attributes: ["name", "icon"],
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
    const user_id = req.user.user_id;

    const expenses = await Expense.findAll({
      where: { user_id },
      include: [
        {
          association: "category",
          attributes: ["name", "icon"],
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
  const transaction = await sequelize.transaction();

  try {
    const user_id = req.user.user_id;
    const expense_id = req.params.expense_id;
    const updateData = matchedData(req);

    const expense = await findExpenseById(expense_id, user_id, transaction);

    const oldAmount = parseFloat(expense.amount);
    const oldCategoryId = expense.category_id;
    const oldExpenseDate = expense.expense_date;

    await expense.update(updateData, { transaction });

    const newAmount = parseFloat(updateData.amount || expense.amount);
    const newCategoryId = updateData.category_id || expense.category_id;
    const newExpenseDate = updateData.expense_date || expense.expense_date;

    if (
      oldAmount !== newAmount ||
      oldCategoryId !== newCategoryId ||
      oldExpenseDate.getTime() !== new Date(newExpenseDate).getTime()
    ) {
      const oldBudgets = await findActiveBudgetsForExpense(
        user_id,
        oldCategoryId,
        oldExpenseDate,
        transaction
      );
      for (const budget of oldBudgets) {
        const newSpentAmount = parseFloat(budget.current_spent) - oldAmount;
        await budget.update(
          { current_spent: Math.max(0, newSpentAmount) },
          { transaction }
        );
      }

      const newBudgets = await findActiveBudgetsForExpense(
        user_id,
        newCategoryId,
        newExpenseDate,
        transaction
      );
      for (const budget of newBudgets) {
        await updateBudgetSpent(budget, newAmount, transaction);
      }
    }

    await transaction.commit();
    return res
      .status(200)
      .json(new ApiResponse(200, expense, "Expense updated successfully!"));
  } catch (error) {
    await transaction.rollback();
    handleControllerError(res, error, "updating expense");
  }
};

// Delete Expense
const deleteExpenseController = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const user_id = req.user.user_id;
    const expense_id = req.params.expense_id;

    const expense = await findExpenseById(expense_id, user_id, transaction);

    const budgetsToUpdate = await findActiveBudgetsForExpense(
      expense.user_id,
      expense.category_id,
      expense.expense_date,
      transaction
    );
    for (const budget of budgetsToUpdate) {
      const newSpentAmount =
        parseFloat(budget.current_spent) - parseFloat(expense.amount);
      await budget.update(
        { current_spent: Math.max(0, newSpentAmount) },
        { transaction }
      );
    }

    await expense.destroy({ transaction });

    await transaction.commit();
    return res
      .status(200)
      .json(new ApiResponse(200, null, "Expense deleted successfully!"));
  } catch (error) {
    await transaction.rollback();
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
