/* eslint-disable no-unused-vars */
const models = {
  sequelize: require("../db"),
  User: require("./user.model"),
  Budget: require("./budget.model"),
  Category: require("./category.model"),
  Expense: require("./expense.model"),
  Report: require("./report.model"),
};

// Default options for associations
const DEFAULT_CASCADE = {
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
};

function setupAssociations() {
  const { User, Budget, Category, Expense, Report } = models;

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

  User.hasMany(Report, {
    foreignKey: "user_id",
    as: "reports",
    ...DEFAULT_CASCADE,
  });

  // ==========================================
  // CATEGORY ASSOCIATIONS
  // ==========================================

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
