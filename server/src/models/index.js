/* eslint-disable no-unused-vars */
const models = {
  sequelize: require("../db"),
  User: require("./user.model"),
  Budget: require("./budget.model"),
  Category: require("./category.model"),
  Expense: require("./expense.model"),
  Receipt: require("./receipt.model"),
  Report: require("./report.model"),
  Alert: require("./alert.model"),
};

// Default options for associations
const DEFAULT_CASCADE = {
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
};

function setupAssociations() {
  const { User, Budget, Category, Expense, Receipt, Report, Alert } = models;

  User.hasMany(Category, {
    foreignKey: "user_id",
    as: "userCategories",
    ...DEFAULT_CASCADE,
  });

  User.hasMany(Expense, {
    foreignKey: "user_id",
    as: "expenses",
    ...DEFAULT_CASCADE,
  });

  User.hasMany(Budget, {
    foreignKey: "user_id",
    as: "budgets",
    ...DEFAULT_CASCADE,
  });

  User.hasMany(Receipt, {
    foreignKey: "user_id",
    as: "receipts",
    ...DEFAULT_CASCADE,
  });

  User.hasMany(Alert, {
    foreignKey: "user_id",
    as: "alerts",
    ...DEFAULT_CASCADE,
  });

  User.hasMany(Report, {
    foreignKey: "user_id",
    as: "reports",
    ...DEFAULT_CASCADE,
  });

  // ==========================================
  // CATEGORY ASSOCIATIONS
  // ==========================================

  Category.belongsTo(User, {
    foreignKey: "user_id",
    as: "user",
    constraints: false,
  });

  Category.hasMany(Expense, {
    foreignKey: "category_id",
    as: "expenses",
    onDelete: "RESTRICT",
  });

  Category.hasMany(Budget, {
    foreignKey: "category_id",
    as: "budgets",
    ...DEFAULT_CASCADE,
  });

  // ==========================================
  // EXPENSE ASSOCIATIONS
  // ==========================================

  Expense.belongsTo(User, {
    foreignKey: "user_id",
    as: "user",
    ...DEFAULT_CASCADE,
  });

  Expense.belongsTo(Category, {
    foreignKey: "category_id",
    as: "category",
    ...DEFAULT_CASCADE,
  });

  Expense.hasOne(Receipt, {
    foreignKey: "expense_id",
    as: "receipt",
    onDelete: "SET NULL",
  });

  // ==========================================
  // BUDGET ASSOCIATIONS
  // ==========================================

  Budget.belongsTo(User, {
    foreignKey: "user_id",
    as: "user",
    ...DEFAULT_CASCADE,
  });

  Budget.belongsTo(Category, {
    foreignKey: "category_id",
    as: "category",
    constraints: false,
  });

  Budget.hasMany(Alert, {
    foreignKey: "budget_id",
    as: "alerts",
    ...DEFAULT_CASCADE,
  });

  // ==========================================
  // RECEIPT ASSOCIATIONS
  // ==========================================

  Receipt.belongsTo(User, {
    foreignKey: "user_id",
    as: "user",
    ...DEFAULT_CASCADE,
  });

  Receipt.belongsTo(Expense, {
    foreignKey: "expense_id",
    as: "expense",
    constraints: false,
  });

  // ==========================================
  // ALERT ASSOCIATIONS
  // ==========================================

  Alert.belongsTo(User, {
    foreignKey: "user_id",
    as: "user",
    ...DEFAULT_CASCADE,
  });

  Alert.belongsTo(Budget, {
    foreignKey: "budget_id",
    as: "budget",
    constraints: false,
  });

  // ==========================================
  // REPORT ASSOCIATIONS
  // ==========================================

  Report.belongsTo(User, {
    foreignKey: "user_id",
    as: "user",
    ...DEFAULT_CASCADE,
  });
}

setupAssociations();

module.exports = models;
