const { DataTypes } = require("sequelize");
const { sequelize } = require("../db");
const { RECEIPT_PROCESSING_STATUS } = require("../constants/enum");

const Receipt = sequelize.define(
  "receipts",
  {
    receipt_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    expense_id: {
      type: DataTypes.UUID,
      allowNull: true,
      comment: "NULL until expense is created from receipt",
    },
    original_filename: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    s3_key: {
      type: DataTypes.STRING(500),
      allowNull: false,
      unique: true,
    },
    s3_bucket: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    file_size: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    mime_type: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    extracted_text: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    textract_job_id: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    processing_status: {
      type: DataTypes.ENUM(Object.values(RECEIPT_PROCESSING_STATUS)),
      defaultValue: RECEIPT_PROCESSING_STATUS.UPLOADED,
    },
    extracted_data: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    ai_analysis: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    confidence_score: {
      type: DataTypes.DECIMAL(3, 2),
      allowNull: true,
      validate: {
        min: 0,
        max: 1,
      },
    },
    error_message: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ["user_id", "processing_status"],
      },
      {
        fields: ["s3_key"],
      },
    ],
  }
);

module.exports = Receipt;
