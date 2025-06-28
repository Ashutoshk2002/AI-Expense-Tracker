const { Budget, Category } = require("../models");
const { matchedData } = require("express-validator");
const { ApiResponse } = require("../utils/ApiResponse");
const { ApiError } = require("../utils/ApiError");
const { handleControllerError } = require("../helper/handleControllerError");
const { Op } = require("sequelize");
const { calculateBudgetPeriod } = require("../helper/CommonHelper");

// Create Budget
const createBudgetController = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const budgetData = matchedData(req);
    const { period_start, period_end } = calculateBudgetPeriod(
      budgetData.budget_period,
      budgetData.period_start
    );

    // Checking overlapping budgets in same category
    if (budgetData.category_id) {
      const existingBudget = await Budget.findOne({
        where: {
          user_id,
          category_id: budgetData.category_id,
          is_active: true,
          [Op.or]: [
            {
              period_start: { [Op.between]: [period_start, period_end] },
            },
            {
              period_end: { [Op.between]: [period_start, period_end] },
            },
            {
              [Op.and]: [
                { period_start: { [Op.lte]: period_start } },
                { period_end: { [Op.gte]: period_end } },
              ],
            },
          ],
        },
      });

      if (existingBudget) {
        throw new ApiError(
          409,
          "Budget already exists for this category in the specified period"
        );
      }
    }

    const budget = await Budget.create({
      ...budgetData,
      user_id,
      period_start,
      period_end,
      current_spent: 0,
    });

    const createdBudget = await Budget.findByPk(budget.budget_id, {
      include: [
        {
          model: Category,
          as: "category",
          attributes: ["category_id", "name", "icon"],
        },
      ],
    });
    return res
      .status(201)
      .json(
        new ApiResponse(201, createdBudget, "Budget created successfully!")
      );
  } catch (error) {
    handleControllerError(res, error, "creating budget");
  }
};

// Get Budget by ID
const getBudgetByIdController = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const { budget_id } = req.params;
    const budget = await Budget.findOne({
      where: { budget_id, user_id },
      include: [
        {
          model: Category,
          as: "category",
          attributes: ["category_id", "name", "icon"],
        },
      ],
    });
    if (!budget) {
      throw new ApiError(404, "Budget not found");
    }
    return res
      .status(200)
      .json(new ApiResponse(200, budget, "Budget found successfully!"));
  } catch (error) {
    handleControllerError(res, error, "fetching budget");
  }
};

// Get All Budgets
const getAllBudgetsController = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const whereClause = { user_id };

    const budgets = await Budget.findAll({
      where: whereClause,
      include: [
        {
          model: Category,
          as: "category",
          attributes: ["category_id", "name", "icon"],
        },
      ],
    });

    // Calculate additional metrics for each budget
    const budgetsWithMetrics = await Promise.all(
      budgets.map(async (budget) => {
        const budgetJson = budget.toJSON();

        // Calculate progress percentage
        budgetJson.progress_percentage =
          budgetJson.amount_limit > 0
            ? Math.min(
                (budgetJson.current_spent / budgetJson.amount_limit) * 100,
                100
              )
            : 0;

        // Calculate remaining amount
        budgetJson.remaining_amount = Math.max(
          budgetJson.amount_limit - budgetJson.current_spent,
          0
        );

        // Calculate days remaining in period
        const now = new Date();
        const periodEnd = new Date(budgetJson.period_end);
        budgetJson.days_remaining = Math.max(
          Math.ceil((periodEnd - now) / (1000 * 60 * 60 * 24)),
          0
        );

        return budgetJson;
      })
    );
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          budgetsWithMetrics,
          "Budgets fetched successfully!"
        )
      );
  } catch (error) {
    handleControllerError(res, error, "fetching budgets");
  }
};

// Update Budget
const updateBudgetController = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const { budget_id } = req.params;
    const budget = await Budget.findOne({ where: { budget_id, user_id } });
    if (!budget) throw new ApiError(404, "Budget not found");
    const updateData = matchedData(req);

    if (
      updateData.budget_period &&
      updateData.budget_period !== budget.budget_period
    ) {
      const { period_start, period_end } = calculateBudgetPeriod(
        updateData.budget_period,
        updateData.period_start || budget.period_start
      );
      updateData.period_start = period_start;
      updateData.period_end = period_end;
    }

    await budget.update(updateData);
    const updatedBudget = await Budget.findByPk(budget_id, {
      include: [
        {
          model: Category,
          as: "category",
          attributes: ["category_id", "name", "icon"],
        },
      ],
    });
    return res
      .status(200)
      .json(
        new ApiResponse(200, updatedBudget, "Budget updated successfully!")
      );
  } catch (error) {
    handleControllerError(res, error, "updating budget");
  }
};

// Delete Budget
const deleteBudgetController = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const { budget_id } = req.params;
    const budget = await Budget.findOne({ where: { budget_id, user_id } });
    if (!budget) throw new ApiError(404, "Budget not found");
    await budget.destroy();
    return res
      .status(200)
      .json(new ApiResponse(200, null, "Budget deleted successfully!"));
  } catch (error) {
    handleControllerError(res, error, "deleting budget");
  }
};

module.exports = {
  createBudgetController,
  getBudgetByIdController,
  getAllBudgetsController,
  updateBudgetController,
  deleteBudgetController,
};
