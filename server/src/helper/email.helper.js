const sesClient = require("../config/SESClient");
const { SendEmailCommand } = require("@aws-sdk/client-ses"); // Your existing SES client
const { SES_SENDER_EMAIL } = require("../constants");

const generateEmailHTML = (user, report, structuredAnalysis, aiInsights) => {
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
      .alert { background: #f8d7da; padding: 15px; margin: 10px 0; border-left: 4px solid #dc3545; border-radius: 4px; }
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
              <div class="metric-value">₹${structuredAnalysis.summary.totalExpenses.toFixed(
                2
              )}</div>
              <div class="metric-label">Total Spent</div>
            </div>
            <div class="metric">
              <div class="metric-value">${
                structuredAnalysis.summary.totalTransactions
              }</div>
              <div class="metric-label">Transactions</div>
            </div>
            <div class="metric">
              <div class="metric-value">₹${structuredAnalysis.summary.averageDailySpending.toFixed(
                2
              )}</div>
              <div class="metric-label">Daily Average</div>
            </div>
          </div>
        </div>

        <div class="summary-card">
          <h2>🎯 Financial Health Score</h2>
          <div class="metric">
            <div class="metric-value" style="color: ${
              structuredAnalysis.financialHealth.score >= 80
                ? "#28a745"
                : structuredAnalysis.financialHealth.score >= 60
                ? "#ffc107"
                : "#dc3545"
            }">${structuredAnalysis.financialHealth.score}/100</div>
          </div>
          <div style="margin-top: 15px;">
            <strong>Strengths:</strong>
            <ul>
              ${aiInsights.strengths
                .map((strength) => `<li>${strength}</li>`)
                .join("")}
            </ul>
            <strong>Areas for Improvement:</strong>
            <ul>
              ${aiInsights.improvements
                .map((area) => `<li>${area}</li>`)
                .join("")}
            </ul>
          </div>
        </div>

        ${
          aiInsights.budgetAlert
            ? `
        <div class="alert">
          <strong>⚠️ Budget Alert:</strong> ${aiInsights.budgetAlert}
        </div>
        `
            : ""
        }

        <div class="summary-card">
          <h2>💡 Key Insights</h2>
          ${aiInsights.keyInsights
            .map((insight) => `<div class="insight">💡 ${insight}</div>`)
            .join("")}
          <div style="margin-top: 15px;">
            <strong>Spending Behavior:</strong> ${aiInsights.spendingBehavior}
          </div>
        </div>

        <div class="summary-card">
          <h2>📈 Recommendations</h2>
          <h4>Immediate Actions:</h4>
          ${aiInsights.recommendations.immediate
            .map((rec) => `<div class="recommendation">⚡ ${rec}</div>`)
            .join("")}
          
          <h4>Long-term Strategies:</h4>
          ${aiInsights.recommendations.longTerm
            .map((rec) => `<div class="recommendation">🎯 ${rec}</div>`)
            .join("")}
        </div>

        <div class="summary-card">
          <h2>📱 Top Spending Categories</h2>
          ${structuredAnalysis.topSpendingCategories
            .map(
              (category) => `
            <div style="margin: 10px 0; padding: 10px; background: #f8f9fa; border-radius: 5px;">
              <div style="display: flex; justify-content: space-between;">
                <strong>${category.name}</strong>
                <span>₹${category.total.toFixed(2)}</span>
              </div>
              <div style="font-size: 0.9em; color: #666;">
                ${category.percentage.toFixed(1)}% • ${
                category.count
              } transactions
              </div>
            </div>
          `
            )
            .join("")}
        </div>

        ${
          structuredAnalysis.budgetAnalysis.length > 0
            ? `
        <div class="summary-card">
          <h2>💳 Budget Performance</h2>
          ${structuredAnalysis.budgetAnalysis
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

const generateEmailText = (user, report, structuredAnalysis, aiInsights) => {
  return `
Your ${report.report_type} Expense Report
Period: ${report.period_start.toLocaleDateString()} - ${report.period_end.toLocaleDateString()}

SUMMARY
- Total Spent: ₹${structuredAnalysis.summary.totalExpenses.toFixed(2)}
- Total Transactions: ${structuredAnalysis.summary.totalTransactions}
- Daily Average: ₹${structuredAnalysis.summary.averageDailySpending.toFixed(2)}

FINANCIAL HEALTH SCORE: ${structuredAnalysis.financialHealth.score}/100

${aiInsights.budgetAlert ? `BUDGET ALERT: ${aiInsights.budgetAlert}\n` : ""}

KEY INSIGHTS:
${aiInsights.keyInsights.map((insight) => `• ${insight}`).join("\n")}

SPENDING BEHAVIOR: ${aiInsights.spendingBehavior}

RECOMMENDATIONS:
Immediate Actions:
${aiInsights.recommendations.immediate.map((rec) => `• ${rec}`).join("\n")}

Long-term Strategies:
${aiInsights.recommendations.longTerm.map((rec) => `• ${rec}`).join("\n")}

TOP CATEGORIES:
${structuredAnalysis.topSpendingCategories
  .map(
    (cat) =>
      `• ${cat.name}: ₹${cat.total.toFixed(2)} (${cat.percentage.toFixed(1)}%)`
  )
  .join("\n")}

Keep tracking your expenses for better financial health!
  `;
};

const sendReportEmail = async (
  user,
  report,
  structuredAnalysis,
  aiInsights
) => {
  const htmlContent = generateEmailHTML(
    user,
    report,
    structuredAnalysis,
    aiInsights
  );
  const textContent = generateEmailText(
    user,
    report,
    structuredAnalysis,
    aiInsights
  );

  const params = {
    Source: SES_SENDER_EMAIL || "arkop.2002@gmail.com",
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
module.exports = {
  sendReportEmail,
};
