const { DataTypes } = require("sequelize");
const { sequelize } = require("../db");
const { ALERT_TYPE, ALERT_SEVERITY } = require("../constants/enum");

const Alert = sequelize.define(
  "alerts",
  {
    alert_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    budget_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    alert_type: {
      type: DataTypes.ENUM(Object.values(ALERT_TYPE)),
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    severity: {
      type: DataTypes.ENUM(Object.values(ALERT_SEVERITY)),
      defaultValue: ALERT_SEVERITY.INFO,
    },
    is_read: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    email_sent: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    email_sent_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    action_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
    },
  },
  {
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ["user_id", "is_read"],
      },
      {
        fields: ["user_id", "alert_type"],
      },
    ],
  }
);

module.exports = Alert;
