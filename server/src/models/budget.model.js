const { DataTypes } = require("sequelize");
const { sequelize } = require("../db");
const { BUDGET_PERIOD } = require("../constants/enum");

const Budget = sequelize.define(
  "budgets",
  {
    budget_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    category_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    amount_limit: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    current_spent: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    budget_period: {
      type: DataTypes.ENUM(Object.values(BUDGET_PERIOD)),
      defaultValue: BUDGET_PERIOD.MONTHLY,
    },
    period_start: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    period_end: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ["user_id", "budget_period"],
      },
      {
        fields: ["user_id", "category_id"],
      },
    ],
  }
);

module.exports = Budget;
