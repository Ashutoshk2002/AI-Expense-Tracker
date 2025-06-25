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
    user_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    icon: {
      type: DataTypes.STRING(50),
      defaultValue: "receipt",
    },
    is_system: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
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
