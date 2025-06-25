const { DataTypes } = require("sequelize");
const { sequelize } = require("../db");
const { EXPENSE_STATUS, PAYMENT_METHOD } = require("../constants/enum");

const Expense = sequelize.define(
  "expenses",
  {
    expense_id: {
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
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0.01,
      },
    },
    currency: {
      type: DataTypes.STRING(3),
      defaultValue: "INR",
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    merchant_name: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    expense_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    receipt_url: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    receipt_text: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    payment_method: {
      type: DataTypes.ENUM(Object.values(PAYMENT_METHOD)),
      defaultValue: PAYMENT_METHOD.OTHER,
    },
    location: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    ai_confidence: {
      type: DataTypes.DECIMAL(3, 2),
      allowNull: true,
      validate: {
        min: 0,
        max: 1,
      },
    },
    is_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM(Object.values(EXPENSE_STATUS)),
      defaultValue: EXPENSE_STATUS.PENDING,
    },
  },
  {
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ["user_id", "expense_date"],
      },
      {
        fields: ["user_id", "category_id"],
      },
      {
        fields: ["expense_date"],
      },
    ],
  }
);

module.exports = Expense;
