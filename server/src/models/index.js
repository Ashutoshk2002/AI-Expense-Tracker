/* eslint-disable no-unused-vars */
const models = {
  sequelize: require("../db"),
  User: require("./user.model"),
};

// Default options for associations
const DEFAULT_CASCADE = {
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
};

function setupAssociations() {
  const { User } = models;
}

setupAssociations();

// Export all models
module.exports = models;
