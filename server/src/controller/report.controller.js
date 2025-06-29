const { ApiError } = require("../utils/ApiError");
const { REPORT_STATUS } = require("../constants/enum");
const { ApiResponse } = require("../utils/ApiResponse");
const { handleControllerError } = require("../helper/handleControllerError");
const { Report, User } = require("../models");

const {
  calculateReportPeriod,
  gatherReportData,
  generateStructuredAnalysis,
  generateSimplifiedAIInsights,
} = require("../helper/report.helper");
const { sendReportEmail } = require("../helper/email.helper");

const generateAndSendReportController = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const { reportType, customPeriod } = req.body;

    const period = calculateReportPeriod(reportType, customPeriod);

    const report = await Report.create({
      user_id,
      report_type: reportType,
      title: `${reportType} Expense Report`,
      period_start: period.start,
      period_end: period.end,
      status: REPORT_STATUS.GENERATING,
    });

    const { expenses, budgets } = await gatherReportData(user_id, period);

    const structuredAnalysis = generateStructuredAnalysis(
      expenses,
      budgets,
      period
    );

    const aiInsights = await generateSimplifiedAIInsights(
      structuredAnalysis,
      reportType,
      period
    );

    await report.update({
      total_expenses: structuredAnalysis.summary.totalExpenses,
      total_transactions: structuredAnalysis.summary.totalTransactions,
      structured_analysis: structuredAnalysis,
      ai_insights: aiInsights,
      status: REPORT_STATUS.COMPLETED,
    });
    const user = await User.findByPk(user_id);
    if (!user) {
      await report.update({ status: "FAILED" });
      throw new ApiError(404, "User not found");
    }
    await sendReportEmail(user, report, structuredAnalysis, aiInsights);

    await report.update({
      email_sent: true,
      email_sent_at: new Date(),
    });

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { reportId: report.report_id },
          "Report generated and sent successfully"
        )
      );
  } catch (error) {
    handleControllerError(res, error, "generating report.");
  }
};

const getUserReportsController = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const { reportType } = req.query;

    const whereClause = { user_id };
    if (reportType) {
      whereClause.report_type = reportType;
    }

    const reports = await Report.findAll({
      where: whereClause,
      order: [["created_at", "DESC"]],

      attributes: [
        "report_id",
        "report_type",
        "title",
        "period_start",
        "period_end",
        "total_expenses",
        "total_transactions",
        "status",
        "email_sent",
        "created_at",
      ],
    });

    return res
      .status(200)
      .json(new ApiResponse(200, reports, "Reports fetched successfully."));
  } catch (error) {
    handleControllerError(res, error, "fetching user reports.");
  }
};

const getReportDetailsController = async (req, res) => {
  try {
    const { report_id } = req.params;

    const report = await Report.findByPk(report_id, {
      include: [
        {
          model: User,
          as: "user",
          attributes: ["user_id", "email", "name"],
        },
      ],
    });

    if (!report) {
      throw new ApiError(404, "Report not found.");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, report, "Report fetched successfully."));
  } catch (error) {
    handleControllerError(res, error, "fetching user report.");
  }
};

// Export functions
module.exports = {
  generateAndSendReportController,
  getUserReportsController,
  getReportDetailsController,
};
