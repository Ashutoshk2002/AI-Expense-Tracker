const {
  DeleteObjectCommand,
  DeleteObjectsCommand,
} = require("@aws-sdk/client-s3");
const { S3_BUCKET_NAME } = require("../constants");
const s3 = require("../config/s3Client");
const { BUDGET_PERIOD } = require("../constants/enum");
const { Budget } = require("../models");
const { Op } = require("sequelize");

const sanitizeQuery = (query) => {
  if (!query) return "";
  return query
    .replace(/[^a-zA-Z0-9\s]/g, "")
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 1)
    .join(" ")
    .slice(0, 100);
};

const deleteFileFromS3 = async (key) => {
  if (!key) return;

  const deleteParams = {
    Bucket: S3_BUCKET_NAME,
    Key: key,
  };

  return await s3.send(new DeleteObjectCommand(deleteParams));
};

const deleteS3Objects = async (s3Keys) => {
  if (!s3Keys || s3Keys.length === 0) return;

  const deleteParams = {
    Bucket: S3_BUCKET_NAME,
    Delete: {
      Objects: s3Keys.map((key) => ({ Key: key })),
      Quiet: false,
    },
  };

  return await s3.send(new DeleteObjectsCommand(deleteParams));
};

/**
 * Calculate budget period start and end dates based on period type
 * @param {string} budgetPeriod - Budget period type (DAILY, WEEKLY, MONTHLY, YEARLY)
 * @param {Date|string} customStartDate - Custom start date (optional)
 * @returns {Object} - Object with period_start and period_end dates
 */
function calculateBudgetPeriod(budgetPeriod, customStartDate = null) {
  const now = new Date();
  let period_start, period_end;

  // If custom start date is provided, use it
  const startDate = customStartDate ? new Date(customStartDate) : now;

  switch (budgetPeriod) {
    case BUDGET_PERIOD.DAILY:
      period_start = new Date(startDate);
      period_start.setHours(0, 0, 0, 0);

      period_end = new Date(period_start);
      period_end.setHours(23, 59, 59, 999);
      break;

    case BUDGET_PERIOD.WEEKLY: {
      period_start = new Date(startDate);
      const dayOfWeek = period_start.getDay();
      const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      period_start.setDate(period_start.getDate() - daysToSubtract);
      period_start.setHours(0, 0, 0, 0);

      period_end = new Date(period_start);
      period_end.setDate(period_end.getDate() + 6);
      period_end.setHours(23, 59, 59, 999);
      break;
    }
    case BUDGET_PERIOD.MONTHLY:
      // Start from the beginning of the month
      period_start = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
      period_start.setHours(0, 0, 0, 0);

      // End at the last day of the month
      period_end = new Date(
        startDate.getFullYear(),
        startDate.getMonth() + 1,
        0
      );
      period_end.setHours(23, 59, 59, 999);
      break;

    case BUDGET_PERIOD.YEARLY:
      // Start from the beginning of the year
      period_start = new Date(startDate.getFullYear(), 0, 1);
      period_start.setHours(0, 0, 0, 0);

      // End at the last day of the year
      period_end = new Date(startDate.getFullYear(), 11, 31);
      period_end.setHours(23, 59, 59, 999);
      break;

    default:
      throw new Error(`Invalid budget period: ${budgetPeriod}`);
  }

  return {
    period_start,
    period_end,
  };
}

// Helper function to find active budgets for an expense
const findActiveBudgetsForExpense = async (
  user_id,
  category_id,
  expense_date,
  transaction
) => {
  const expenseDate = new Date(expense_date);

  return await Budget.findAll({
    where: {
      user_id,
      is_active: true,
      period_start: { [Op.lte]: expenseDate },
      period_end: { [Op.gte]: expenseDate },
      [Op.or]: [{ category_id }, { category_id: null }],
    },
    transaction,
  });
};

// Helper function to update budget spent amount
const updateBudgetSpent = async (budget, expenseAmount, transaction) => {
  const newSpentAmount =
    parseFloat(budget.current_spent) + parseFloat(expenseAmount);

  await budget.update({ current_spent: newSpentAmount }, { transaction });
};

module.exports = {
  sanitizeQuery,
  deleteFileFromS3,
  deleteS3Objects,
  calculateBudgetPeriod,
  findActiveBudgetsForExpense,
  updateBudgetSpent,
};
