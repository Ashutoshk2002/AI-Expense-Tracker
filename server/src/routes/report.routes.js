const router = require("express").Router();
const reportController = require("../controller/report.controller.js");
const reportValidator = require("../validators/report.validator.js");
const { validateRequest, verifyToken } = require("../middleware/index.js");

// Middleware chains
const validateGenerateReportChain = [
  reportValidator.validateReportGeneration,
  validateRequest,
];

router.route("/").get(verifyToken, reportController.getUserReportsController);

router
  .route("/generate")
  .get(
    verifyToken,
    validateGenerateReportChain,
    reportController.generateAndSendReportController
  );

router
  .route("/:report_id")
  .get(verifyToken, reportController.getReportDetailsController);

module.exports = router;
