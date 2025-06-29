const { InvokeModelCommand } = require("@aws-sdk/client-bedrock-runtime");
const { SendEmailCommand } = require("@aws-sdk/client-ses");
const bedrockClient = require("../config/bedrockClient");
const sesClient = require("../config/SESClient");
const { Op } = require("sequelize");
const { ApiError } = require("../utils/ApiError");
const { REPORT_TYPE, REPORT_STATUS } = require("../constants/enum");
const { ApiResponse } = require("../utils/ApiResponse");
const { handleControllerError } = require("../helper/handleControllerError");
const { Report, User, Expense, Budget, Category } = require("../models");
const { logger } = require("../utils/logger");

const TITAN_MODEL_ID = "amazon.titan-text-lite-v1";

const calculateReportPeriod = (reportType, customPeriod) => {
  const now = new Date();
  let start, end;

  switch (reportType) {
    case REPORT_TYPE.WEEKLY:
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
      end = now;
      break;
    case REPORT_TYPE.MONTHLY:
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      end = new Date(now.getFullYear(), now.getMonth(), 0);
      break;
    case REPORT_TYPE.QUARTERLY: {
      const quarter = Math.floor(now.getMonth() / 3);
      start = new Date(now.getFullYear(), quarter * 3 - 3, 1);
      end = new Date(now.getFullYear(), quarter * 3, 0);
      break;
    }
    case REPORT_TYPE.YEARLY:
      start = new Date(now.getFullYear() - 1, 0, 1);
      end = new Date(now.getFullYear() - 1, 11, 31);
      break;
    case REPORT_TYPE.CUSTOM:
      if (!customPeriod) {
        throw new Error("Custom period required for CUSTOM report type");
      }
      start = new Date(customPeriod.start);
      end = new Date(customPeriod.end);
      break;
    default:
      throw new Error("Invalid report type");
  }

  return { start, end };
};

const gatherReportData = async (userId, period) => {
  const expenses = await Expense.findAll({
    where: {
      user_id: userId,
      expense_date: {
        [Op.between]: [period.start, period.end],
      },
    },
    include: [
      {
        model: Category,
        as: "category",
        attributes: ["name", "icon"],
      },
    ],
    order: [["expense_date", "DESC"]],
  });

  // Fetch budgets for the period
  const budgets = await Budget.findAll({
    where: {
      user_id: userId,
      is_active: true,
      [Op.or]: [
        {
          period_start: {
            [Op.lte]: period.end,
          },
          period_end: {
            [Op.gte]: period.start,
          },
        },
      ],
    },
    include: [
      {
        model: Category,
        as: "category",
        attributes: ["name", "icon"],
      },
    ],
  });

  // Calculate totals and analytics
  const totalExpenses = expenses.reduce(
    (sum, exp) => sum + parseFloat(exp.amount),
    0
  );
  const totalTransactions = expenses.length;

  // Group by category
  const categoryBreakdown = expenses.reduce((acc, expense) => {
    const categoryName = expense.category?.name || "Uncategorized";
    if (!acc[categoryName]) {
      acc[categoryName] = {
        total: 0,
        count: 0,
        percentage: 0,
      };
    }
    acc[categoryName].total += parseFloat(expense.amount);
    acc[categoryName].count += 1;
    return acc;
  }, {});

  // Calculate percentages
  Object.keys(categoryBreakdown).forEach((category) => {
    categoryBreakdown[category].percentage =
      totalExpenses > 0
        ? (categoryBreakdown[category].total / totalExpenses) * 100
        : 0;
  });

  // Group by payment method
  const paymentMethodBreakdown = expenses.reduce((acc, expense) => {
    const method = expense.payment_method;
    if (!acc[method]) {
      acc[method] = { total: 0, count: 0 };
    }
    acc[method].total += parseFloat(expense.amount);
    acc[method].count += 1;
    return acc;
  }, {});

  // Daily spending trend
  const dailySpending = expenses.reduce((acc, expense) => {
    const date = expense.expense_date.toISOString().split("T")[0];
    if (!acc[date]) {
      acc[date] = 0;
    }
    acc[date] += parseFloat(expense.amount);
    return acc;
  }, {});

  // Budget analysis
  const budgetAnalysis = budgets.map((budget) => {
    const categoryExpenses = expenses.filter(
      (exp) => exp.category_id === budget.category_id
    );
    const spent = categoryExpenses.reduce(
      (sum, exp) => sum + parseFloat(exp.amount),
      0
    );
    const percentage =
      budget.amount_limit > 0
        ? (spent / parseFloat(budget.amount_limit)) * 100
        : 0;

    return {
      budgetName: budget.name,
      categoryName: budget.category?.name || "All Categories",
      limit: parseFloat(budget.amount_limit),
      spent: spent,
      remaining: parseFloat(budget.amount_limit) - spent,
      percentage: percentage,
      status:
        percentage > 100 ? "OVER_BUDGET" : percentage > 80 ? "WARNING" : "GOOD",
    };
  });
  return {
    totalExpenses,
    totalTransactions,
    categoryBreakdown,
    paymentMethodBreakdown,
    dailySpending,
    budgetAnalysis,
    period,
    expenses: expenses.map((exp) => ({
      id: exp.expense_id,
      amount: parseFloat(exp.amount),
      category: exp.category?.name || "Uncategorized",
      description: exp.description,
      date: exp.expense_date,
      paymentMethod: exp.payment_method,
      merchantName: exp.merchant_name,
    })),
  };
};

const generateAIAnalysis = async (reportData, reportType, period) => {
  const prompt = createAnalysisPrompt(reportData, reportType, period);

  try {
    const command = new InvokeModelCommand({
      modelId: TITAN_MODEL_ID,
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify({
        inputText: prompt,
        textGenerationConfig: {
          maxTokenCount: 3000,
          temperature: 0.7,
          topP: 0.9,
          stopSequences: [],
        },
      }),
    });

    const response = await bedrockClient.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));

    const generatedText = responseBody.results[0].outputText;

    const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsedAnalysis = JSON.parse(jsonMatch[0]);

      return validateAndFixAnalysis(parsedAnalysis);
    } else {
      logger.warn("No valid JSON found in Titan response, using fallback");
      return generateFallbackAnalysis(reportData);
    }
  } catch (error) {
    logger.error("Error generating AI analysis:", error);
    return generateFallbackAnalysis(reportData);
  }
};

const createAnalysisPrompt = (reportData, reportType, period) => {
  return `You are a financial advisor analyzing expense data. Analyze the following expense report and provide insights in valid JSON format only. Do not include any text before or after the JSON.

EXPENSE REPORT DATA:
- Report Type: ${reportType}
- Period: ${period.start.toDateString()} to ${period.end.toDateString()}
- Total Expenses: ₹${reportData.totalExpenses.toFixed(2)}
- Total Transactions: ${reportData.totalTransactions}
- Average Daily Spending: ₹${(
    reportData.totalExpenses / Object.keys(reportData.dailySpending).length || 0
  ).toFixed(2)}

CATEGORY BREAKDOWN:
${Object.entries(reportData.categoryBreakdown)
  .map(
    ([category, data]) =>
      `- ${category}: ₹${data.total.toFixed(2)} (${data.percentage.toFixed(
        1
      )}%, ${data.count} transactions)`
  )
  .join("\n")}

BUDGET ANALYSIS:
${reportData.budgetAnalysis
  .map(
    (budget) =>
      `- ${budget.budgetName}: ₹${budget.spent.toFixed(
        2
      )}/₹${budget.limit.toFixed(2)} (${budget.percentage.toFixed(1)}%) - ${
        budget.status
      }`
  )
  .join("\n")}

PAYMENT METHODS:
${Object.entries(reportData.paymentMethodBreakdown)
  .map(
    ([method, data]) =>
      `- ${method}: ₹${data.total.toFixed(2)} (${data.count} transactions)`
  )
  .join("\n")}

Provide your analysis in this exact JSON structure:
{
  "summary": {
    "totalSpent": ${reportData.totalExpenses},
    "averageDailySpending": ${(
      reportData.totalExpenses / Object.keys(reportData.dailySpending).length ||
      0
    ).toFixed(2)},
    "keyInsights": ["insight about spending patterns", "insight about top categories", "insight about budget performance"]
  },
  "categoryAnalysis": {
    "topSpendingCategories": ["category1", "category2", "category3"],
    "recommendations": ["specific recommendation for category management", "suggestion for reducing expenses"]
  },
  "budgetPerformance": {
    "overBudgetCount": ${
      reportData.budgetAnalysis.filter((b) => b.status === "OVER_BUDGET").length
    },
    "warningBudgetCount": ${
      reportData.budgetAnalysis.filter((b) => b.status === "WARNING").length
    },
    "totalBudgetVariance": 0,
    "budgetRecommendations": ["budget management tip", "spending control advice"]
  },
  "spendingPatterns": {
    "peakSpendingDays": ["describe peak spending days"],
    "spendingTrends": "describe overall spending trends",
    "seasonalInsights": "any seasonal patterns observed"
  },
  "recommendations": {
    "shortTerm": ["immediate action 1", "immediate action 2"],
    "longTerm": ["long-term strategy 1", "long-term strategy 2"],
    "budgetAdjustments": ["budget adjustment 1", "budget adjustment 2"]
  },
  "financialHealth": {
    "score": ${calculateFinancialHealthScore(reportData)},
    "strengths": ["financial strength 1", "financial strength 2"],
    "areasForImprovement": ["improvement area 1", "improvement area 2"]
  }
}

Return only the JSON object above with your specific analysis and recommendations.`;
};

const calculateFinancialHealthScore = (reportData) => {
  let score = 70;

  const overBudgetCount = reportData.budgetAnalysis.filter(
    (b) => b.status === "OVER_BUDGET"
  ).length;
  const totalBudgets = reportData.budgetAnalysis.length;

  if (totalBudgets > 0) {
    const budgetAdherence = 1 - overBudgetCount / totalBudgets;
    score += budgetAdherence * 20 - 10;
  }

  const categoryValues = Object.values(reportData.categoryBreakdown);
  if (categoryValues.length > 0) {
    const maxCategoryPercentage = Math.max(
      ...categoryValues.map((c) => c.percentage)
    );
    if (maxCategoryPercentage > 70) {
      score -= 15;
    } else if (maxCategoryPercentage < 40) {
      score += 10;
    }
  }

  const avgTransactionAmount =
    reportData.totalExpenses / reportData.totalTransactions;
  if (avgTransactionAmount < 500) {
    score += 5;
  }

  return Math.max(1, Math.min(100, Math.round(score)));
};

const generateFallbackAnalysis = (reportData) => {
  const avgDaily =
    reportData.totalExpenses / Object.keys(reportData.dailySpending).length ||
    0;
  const topCategory = Object.keys(reportData.categoryBreakdown).sort(
    (a, b) =>
      reportData.categoryBreakdown[b].total -
      reportData.categoryBreakdown[a].total
  )[0];
  return {
    summary: {
      totalSpent: reportData.totalExpenses,
      averageDailySpending: avgDaily,
      keyInsights: [
        `Total spending was ₹${reportData.totalExpenses.toFixed(2)}`,
        `Average daily spending was ₹${avgDaily.toFixed(2)}`,
        `Highest spending category was ${topCategory || "N/A"}`,
      ],
    },
    categoryAnalysis: {
      topSpendingCategories: Object.keys(reportData.categoryBreakdown)
        .sort(
          (a, b) =>
            reportData.categoryBreakdown[b].total -
            reportData.categoryBreakdown[a].total
        )
        .slice(0, 3),
      recommendations: [
        "Review top spending categories",
        "Consider setting stricter budgets",
      ],
    },
    budgetPerformance: {
      overBudgetCount: reportData.budgetAnalysis.filter(
        (b) => b.status === "OVER_BUDGET"
      ).length,
      warningBudgetCount: reportData.budgetAnalysis.filter(
        (b) => b.status === "WARNING"
      ).length,
      totalBudgetVariance: 0,
      budgetRecommendations: ["Monitor budget usage more closely"],
    },
    spendingPatterns: {
      peakSpendingDays: [],
      spendingTrends: "Regular spending pattern observed",
      seasonalInsights: "No specific seasonal patterns identified",
    },
    recommendations: {
      shortTerm: ["Track daily expenses", "Review unnecessary expenses"],
      longTerm: ["Build an emergency fund", "Plan major purchases"],
      budgetAdjustments: ["Adjust budgets based on actual spending"],
    },
    financialHealth: {
      score: calculateFinancialHealthScore(reportData),
      strengths: ["Regular expense tracking"],
      areasForImprovement: ["Budget adherence", "Expense categorization"],
    },
  };
};

const sendReportEmail = async (user, report, aiAnalysis) => {
  const htmlContent = generateEmailHTML(user, report, aiAnalysis);
  const textContent = generateEmailText(user, report, aiAnalysis);

  const params = {
    Source: "ashutoshkhairnar1966@gmail.com",
    Destination: {
      ToAddresses: [user.email],
    },
    Message: {
      Subject: {
        Data: `Your ${
          report.report_type
        } Expense Report - ${new Date().toLocaleDateString()}`,
        Charset: "UTF-8",
      },
      Body: {
        Html: {
          Data: htmlContent,
          Charset: "UTF-8",
        },
        Text: {
          Data: textContent,
          Charset: "UTF-8",
        },
      },
    },
  };

  const command = new SendEmailCommand(params);
  await sesClient.send(command);
};
// Function to validate and fix AI analysis structure
const validateAndFixAnalysis = (analysis) => {
  const defaultAnalysis = {
    summary: {
      keyInsights: [
        "Your expense tracking shows consistent financial activity",
        "Consider reviewing your spending patterns for optimization opportunities",
      ],
    },
    financialHealth: {
      score: 70,
      strengths: ["Regular expense tracking", "Maintaining financial records"],
      areasForImprovement: ["Budget optimization", "Expense categorization"],
    },
    recommendations: {
      shortTerm: [
        "Review your largest expense categories",
        "Set up budget alerts for high-spending areas",
      ],
      longTerm: [
        "Create a comprehensive budgeting strategy",
        "Build an emergency fund for financial security",
      ],
    },
  };

  // Merge with defaults to ensure all required fields exist
  return {
    summary: {
      keyInsights:
        analysis?.summary?.keyInsights || defaultAnalysis.summary.keyInsights,
    },
    financialHealth: {
      score:
        analysis?.financialHealth?.score ||
        defaultAnalysis.financialHealth.score,
      strengths:
        analysis?.financialHealth?.strengths ||
        defaultAnalysis.financialHealth.strengths,
      areasForImprovement:
        analysis?.financialHealth?.areasForImprovement ||
        defaultAnalysis.financialHealth.areasForImprovement,
    },
    recommendations: {
      shortTerm:
        analysis?.recommendations?.shortTerm ||
        defaultAnalysis.recommendations.shortTerm,
      longTerm:
        analysis?.recommendations?.longTerm ||
        defaultAnalysis.recommendations.longTerm,
    },
  };
};
const generateEmailHTML = (user, report, aiAnalysis) => {
  // Ensure aiAnalysis has the required structure
  const safeAnalysis = validateAndFixAnalysis(aiAnalysis);

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Expense Report</title>
    <style>
      body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
      .container { max-width: 600px; margin: 0 auto; padding: 20px; }
      .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
      .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
      .summary-card { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
      .metric { text-align: center; margin: 10px 0; }
      .metric-value { font-size: 2em; font-weight: bold; color: #667eea; }
      .metric-label { color: #666; font-size: 0.9em; }
      .insight { background: #e8f4fd; padding: 15px; margin: 10px 0; border-left: 4px solid #667eea; border-radius: 4px; }
      .recommendation { background: #fff3cd; padding: 15px; margin: 10px 0; border-left: 4px solid #ffc107; border-radius: 4px; }
      .budget-status { padding: 5px 10px; border-radius: 20px; font-size: 0.8em; font-weight: bold; }
      .status-good { background: #d4edda; color: #155724; }
      .status-warning { background: #fff3cd; color: #856404; }
      .status-over-budget { background: #f8d7da; color: #721c24; }
      .footer { text-align: center; padding: 20px; color: #666; font-size: 0.9em; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>💰 Your ${report.report_type} Expense Report</h1>
        <p>Period: ${report.period_start.toLocaleDateString()} - ${report.period_end.toLocaleDateString()}</p>
      </div>
      
      <div class="content">
        <div class="summary-card">
          <h2>📊 Summary</h2>
          <div style="display: flex; justify-content: space-around; flex-wrap: wrap;">
            <div class="metric">
              <div class="metric-value">₹${report.total_expenses.toFixed(
                2
              )}</div>
              <div class="metric-label">Total Spent</div>
            </div>
            <div class="metric">
              <div class="metric-value">${report.total_transactions}</div>
              <div class="metric-label">Transactions</div>
            </div>
            <div class="metric">
              <div class="metric-value">₹${(
                report.total_expenses / report.total_transactions || 0
              ).toFixed(2)}</div>
              <div class="metric-label">Avg per Transaction</div>
            </div>
          </div>
        </div>

        <div class="summary-card">
          <h2>🎯 Financial Health Score</h2>
          <div class="metric">
            <div class="metric-value" style="color: ${
              safeAnalysis.financialHealth.score >= 80
                ? "#28a745"
                : safeAnalysis.financialHealth.score >= 60
                ? "#ffc107"
                : "#dc3545"
            }">${safeAnalysis.financialHealth.score}/100</div>
          </div>
          <div style="margin-top: 15px;">
            <strong>Strengths:</strong>
            <ul>
              ${safeAnalysis.financialHealth.strengths
                .map((strength) => `<li>${strength}</li>`)
                .join("")}
            </ul>
            <strong>Areas for Improvement:</strong>
            <ul>
              ${safeAnalysis.financialHealth.areasForImprovement
                .map((area) => `<li>${area}</li>`)
                .join("")}
            </ul>
          </div>
        </div>

        <div class="summary-card">
          <h2>💡 Key Insights</h2>
          ${safeAnalysis.summary.keyInsights
            .map((insight) => `<div class="insight">💡 ${insight}</div>`)
            .join("")}
        </div>

        <div class="summary-card">
          <h2>📈 Recommendations</h2>
          <h4>Short-term Actions:</h4>
          ${safeAnalysis.recommendations.shortTerm
            .map((rec) => `<div class="recommendation">⚡ ${rec}</div>`)
            .join("")}
          
          <h4>Long-term Strategies:</h4>
          ${safeAnalysis.recommendations.longTerm
            .map((rec) => `<div class="recommendation">🎯 ${rec}</div>`)
            .join("")}
        </div>

        ${
          report.report_data?.budgetAnalysis?.length > 0
            ? `
        <div class="summary-card">
          <h2>💳 Budget Performance</h2>
          ${report.report_data.budgetAnalysis
            .map(
              (budget) => `
            <div style="margin: 15px 0; padding: 15px; background: #f8f9fa; border-radius: 8px;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <strong>${budget.budgetName}</strong>
                <span class="budget-status status-${budget.status
                  .toLowerCase()
                  .replace("_", "-")}">
                  ${budget.status.replace("_", " ")}
                </span>
              </div>
              <div style="margin-top: 10px;">
                <div style="background: #e9ecef; height: 10px; border-radius: 5px; overflow: hidden;">
                  <div style="width: ${Math.min(
                    budget.percentage,
                    100
                  )}%; height: 100%; background: ${
                budget.status === "OVER_BUDGET"
                  ? "#dc3545"
                  : budget.status === "WARNING"
                  ? "#ffc107"
                  : "#28a745"
              };"></div>
                </div>
                <div style="margin-top: 5px; font-size: 0.9em; color: #666;">
                  ₹${budget.spent.toFixed(2)} / ₹${budget.limit.toFixed(
                2
              )} (${budget.percentage.toFixed(1)}%)
                </div>
              </div>
            </div>
          `
            )
            .join("")}
        </div>
        `
            : ""
        }
      </div>
      
      <div class="footer">
        <p>This report was generated automatically. Keep tracking your expenses for better financial health! 💪</p>
      </div>
    </div>
  </body>
  </html>`;
};

const generateEmailText = (user, report, aiAnalysis) => {
  return `
Your ${report.report_type} Expense Report
Period: ${report.period_start.toLocaleDateString()} - ${report.period_end.toLocaleDateString()}

SUMMARY
- Total Spent: ₹${report.total_expenses.toFixed(2)}
- Total Transactions: ${report.total_transactions}
- Average per Transaction: ₹${(
    report.total_expenses / report.total_transactions || 0
  ).toFixed(2)}

FINANCIAL HEALTH SCORE: ${aiAnalysis.financialHealth.score}/100

KEY INSIGHTS:
${aiAnalysis.summary.keyInsights.map((insight) => `• ${insight}`).join("\n")}

RECOMMENDATIONS:
Short-term:
${aiAnalysis.recommendations.shortTerm.map((rec) => `• ${rec}`).join("\n")}

Long-term:
${aiAnalysis.recommendations.longTerm.map((rec) => `• ${rec}`).join("\n")}

Keep tracking your expenses for better financial health!
  `;
};

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

    const reportData = await gatherReportData(user_id, period);

    const aiAnalysis = await generateAIAnalysis(reportData, reportType, period);

    await report.update({
      total_expenses: reportData.totalExpenses,
      total_transactions: reportData.totalTransactions,
      report_data: {
        ...reportData,
        aiAnalysis,
      },
      status: REPORT_STATUS.COMPLETED,
    });
    const user = await User.findByPk(user_id);
    if (!user) {
      await report.update({ status: "FAILED" });
      throw new ApiError(404, "User not found");
    }
    await sendReportEmail(user, report, aiAnalysis);

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
