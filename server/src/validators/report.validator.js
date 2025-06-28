const { body } = require("express-validator");
const { REPORT_TYPE } = require("../constants/enum");

const validateReportGeneration = [
  body("reportType")
    .notEmpty()
    .withMessage("reportType is required")
    .isIn(Object.values(REPORT_TYPE))
    .withMessage(
      `reportType must be one of: ${Object.values(REPORT_TYPE).join(", ")}`
    ),

  body("customPeriod")
    .if(body("reportType").equals(REPORT_TYPE.CUSTOM))
    .notEmpty()
    .withMessage("customPeriod is required for CUSTOM report type")
    .isObject()
    .withMessage("customPeriod must be an object with start and end keys"),
  body("customPeriod.start")
    .if(body("reportType").equals(REPORT_TYPE.CUSTOM))
    .notEmpty()
    .withMessage("customPeriod.start is required for CUSTOM report type")
    .isISO8601()
    .withMessage("customPeriod.start must be a valid date"),
  body("customPeriod.end")
    .if(body("reportType").equals(REPORT_TYPE.CUSTOM))
    .notEmpty()
    .withMessage("customPeriod.end is required for CUSTOM report type")
    .isISO8601()
    .withMessage("customPeriod.end must be a valid date"),
];

module.exports = { validateReportGeneration };
