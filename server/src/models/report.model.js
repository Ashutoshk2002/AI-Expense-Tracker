const { DataTypes } = require("sequelize");
const { sequelize } = require("../db");
const { REPORT_STATUS, REPORT_TYPE } = require("../constants/enum");

const Report = sequelize.define(
  "reports",
  {
    report_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    report_type: {
      type: DataTypes.ENUM(Object.values(REPORT_TYPE)),
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    period_start: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    period_end: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    total_expenses: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    total_transactions: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    report_data: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM(Object.values(REPORT_STATUS)),
      defaultValue: REPORT_STATUS.GENERATING,
    },
    email_sent: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    email_sent_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ["user_id", "report_type"],
      },
      {
        fields: ["user_id", "period_start", "period_end"],
      },
    ],
  }
);

module.exports = Report;
