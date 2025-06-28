const { DataTypes } = require("sequelize");
const { sequelize } = require("../db");

const Category = sequelize.define(
  "categories",
  {
    category_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    icon: {
      type: DataTypes.STRING(50),
      defaultValue: "receipt",
    },
  },
  {
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ["name"],
        where: {
          is_system: true,
        },
      },
    ],
  }
);

module.exports = Category;
