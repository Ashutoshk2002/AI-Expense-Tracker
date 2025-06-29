const { InvokeModelCommand } = require("@aws-sdk/client-bedrock-runtime");
const { REPORT_TYPE } = require("../constants/enum");
const { Expense, Category, Budget } = require("../models");
const { logger } = require("../utils/logger");
const { Op } = require("sequelize");
const bedrockClient = require("../config/bedrockClient");

const TITAN_MODEL_ID = "amazon.titan-text-lite-v1";

const analyzeSpendingPatterns = (dailySpending) => {
  const spendingArray = Object.entries(dailySpending).map(([date, amount]) => ({
    date,
    amount,
    dayOfWeek: new Date(date).getDay(),
  }));

  // Find peak spending days
  const sortedByAmount = [...spendingArray].sort((a, b) => b.amount - a.amount);
  const peakSpendingDays = sortedByAmount.slice(0, 3);

  const dayOfWeekSpending = spendingArray.reduce(
    (acc, { dayOfWeek, amount }) => {
      acc[dayOfWeek] = (acc[dayOfWeek] || 0) + amount;
      return acc;
    },
    {}
  );

  const dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const topSpendingDay = Object.entries(dayOfWeekSpending).sort(
    ([, a], [, b]) => b - a
  )[0];

  return {
    peakSpendingDays: peakSpendingDays.map((day) => ({
      date: day.date,
      amount: day.amount,
      dayName: dayNames[day.dayOfWeek],
    })),
    dayOfWeekAnalysis: {
      topSpendingDay: dayNames[parseInt(topSpendingDay[0])],
      topSpendingAmount: topSpendingDay[1],
      breakdown: Object.entries(dayOfWeekSpending).map(([day, amount]) => ({
        day: dayNames[parseInt(day)],
        amount,
      })),
    },
    totalSpendingDays: spendingArray.length,
    averageSpendingPerDay:
      spendingArray.reduce((sum, day) => sum + day.amount, 0) /
      spendingArray.length,
  };
};

const validateAndEnhanceAIInsights = (insights, structuredAnalysis) => {
  const { budgetAnalysis } = structuredAnalysis;

  // Validate and provide contextual defaults
  const validatedInsights = {
    keyInsights:
      Array.isArray(insights?.keyInsights) && insights.keyInsights.length > 0
        ? insights.keyInsights.filter(
            (insight) =>
              typeof insight === "string" &&
              insight.length > 10 &&
              !insight.includes("insight about") &&
              !insight.includes("Quick action")
          )
        : generateContextualKeyInsights(structuredAnalysis),

    spendingBehavior:
      insights?.spendingBehavior &&
      typeof insights.spendingBehavior === "string" &&
      insights.spendingBehavior.length > 20 &&
      !insights.spendingBehavior.includes("Brief description")
        ? insights.spendingBehavior
        : generateContextualSpendingBehavior(structuredAnalysis),

    recommendations: {
      immediate:
        Array.isArray(insights?.recommendations?.immediate) &&
        insights.recommendations.immediate.length > 0
          ? insights.recommendations.immediate.filter(
              (rec) =>
                typeof rec === "string" &&
                rec.length > 15 &&
                !rec.includes("Quick action")
            )
          : generateContextualImmediateRecommendations(structuredAnalysis),

      longTerm:
        Array.isArray(insights?.recommendations?.longTerm) &&
        insights.recommendations.longTerm.length > 0
          ? insights.recommendations.longTerm.filter(
              (rec) =>
                typeof rec === "string" &&
                rec.length > 15 &&
                !rec.includes("Strategy")
            )
          : generateContextualLongTermRecommendations(structuredAnalysis),
    },

    strengths:
      Array.isArray(insights?.strengths) && insights.strengths.length > 0
        ? insights.strengths.filter(
            (strength) =>
              typeof strength === "string" &&
              strength.length > 10 &&
              !strength.includes("Financial strength")
          )
        : generateContextualStrengths(structuredAnalysis),

    improvements:
      Array.isArray(insights?.improvements) && insights.improvements.length > 0
        ? insights.improvements.filter(
            (improvement) =>
              typeof improvement === "string" &&
              improvement.length > 10 &&
              !improvement.includes("Area to improve")
          )
        : generateContextualImprovements(structuredAnalysis),

    budgetAlert: generateContextualBudgetAlert(
      budgetAnalysis,
      insights?.budgetAlert
    ),
  };

  // Ensure minimum content
  if (validatedInsights.keyInsights.length === 0) {
    validatedInsights.keyInsights =
      generateContextualKeyInsights(structuredAnalysis);
  }

  if (validatedInsights.recommendations.immediate.length === 0) {
    validatedInsights.recommendations.immediate =
      generateContextualImmediateRecommendations(structuredAnalysis);
  }

  if (validatedInsights.recommendations.longTerm.length === 0) {
    validatedInsights.recommendations.longTerm =
      generateContextualLongTermRecommendations(structuredAnalysis);
  }

  return validatedInsights;
};

const generateContextualKeyInsights = (structuredAnalysis) => {
  const { summary, topSpendingCategories, financialHealth, budgetAnalysis } =
    structuredAnalysis;
  const insights = [];

  // Total spending insight
  insights.push(
    `You spent ₹${summary.totalExpenses.toFixed(2)} across ${
      summary.totalTransactions
    } transactions this period`
  );

  // Top category insight
  if (topSpendingCategories.length > 0) {
    const topCat = topSpendingCategories[0];
    insights.push(
      `${
        topCat.name
      } was your largest expense category at ₹${topCat.total.toFixed(
        2
      )} (${topCat.percentage.toFixed(1)}% of total spending)`
    );
  }

  // Budget performance insight
  if (budgetAnalysis.length > 0) {
    const overBudget = budgetAnalysis.filter(
      (b) => b.status === "OVER_BUDGET"
    ).length;
    if (overBudget > 0) {
      insights.push(
        `${overBudget} of your ${budgetAnalysis.length} budgets exceeded their limits`
      );
    } else {
      insights.push(
        `All ${budgetAnalysis.length} budgets are within their limits - excellent budget discipline`
      );
    }
  }

  // Financial health insight
  if (financialHealth.score >= 80) {
    insights.push(
      `Your financial health score of ${financialHealth.score}/100 indicates strong expense management`
    );
  } else if (financialHealth.score >= 60) {
    insights.push(
      `Your financial health score of ${financialHealth.score}/100 shows room for improvement in expense control`
    );
  } else {
    insights.push(
      `Your financial health score of ${financialHealth.score}/100 suggests significant opportunities for better expense management`
    );
  }

  return insights.slice(0, 4);
};

const generateContextualSpendingBehavior = (structuredAnalysis) => {
  const { summary, topSpendingCategories, spendingPatterns } =
    structuredAnalysis;

  const avgTransaction = summary.averageTransactionAmount;
  const topCatPercentage = topSpendingCategories[0]?.percentage || 0;
  const activeDays = spendingPatterns.totalSpendingDays;

  if (avgTransaction > 2000) {
    return `You tend to make larger, less frequent purchases with an average transaction of ₹${avgTransaction.toFixed(
      2
    )}. Your spending is active on ${activeDays} days during this period.`;
  } else if (avgTransaction < 500) {
    return `You frequently make smaller purchases with an average transaction of ₹${avgTransaction.toFixed(
      2
    )}. This suggests regular, day-to-day expense patterns across ${activeDays} active days.`;
  } else {
    return `Your spending shows moderate transaction sizes averaging ₹${avgTransaction.toFixed(
      2
    )} spread across ${activeDays} days. ${
      topCatPercentage > 50
        ? "Your expenses are concentrated in fewer categories."
        : "Your expenses are well-distributed across categories."
    }`;
  }
};

const generateContextualImmediateRecommendations = (structuredAnalysis) => {
  const { topSpendingCategories, financialHealth, budgetAnalysis } =
    structuredAnalysis;
  const recommendations = [];

  // Budget-based recommendations
  const overBudgetItems = budgetAnalysis.filter(
    (b) => b.status === "OVER_BUDGET"
  );
  if (overBudgetItems.length > 0) {
    recommendations.push(
      `Review and adjust spending in ${
        overBudgetItems[0].categoryName
      } - currently over budget by ₹${Math.abs(
        overBudgetItems[0].remaining
      ).toFixed(2)}`
    );
  }

  // Top category recommendation
  if (topSpendingCategories.length > 0) {
    const topCat = topSpendingCategories[0];
    if (topCat.percentage > 40) {
      recommendations.push(
        `Consider ways to reduce ${
          topCat.name
        } expenses, which represent ${topCat.percentage.toFixed(
          1
        )}% of your total spending`
      );
    }
  }

  // Health score based recommendation
  if (financialHealth.score < 70) {
    recommendations.push(
      "Set up spending alerts for your top 3 expense categories to improve awareness"
    );
  }

  // Default if none apply
  if (recommendations.length === 0) {
    recommendations.push(
      "Track your daily expenses more consistently to identify spending patterns"
    );
    recommendations.push(
      "Review your largest expense category for potential cost reductions"
    );
  }

  return recommendations.slice(0, 3);
};

const generateContextualLongTermRecommendations = (structuredAnalysis) => {
  const { summary, budgetAnalysis, financialHealth } = structuredAnalysis;
  const recommendations = [];

  if (budgetAnalysis.length === 0) {
    recommendations.push(
      "Create budgets for your top 3 spending categories to improve financial control"
    );
  } else if (budgetAnalysis.length < 3) {
    recommendations.push(
      "Expand your budgeting to cover more expense categories for comprehensive financial planning"
    );
  }

  if (financialHealth.score < 80) {
    recommendations.push(
      "Develop a monthly spending plan to optimize your expense allocation across categories"
    );
  }

  recommendations.push(
    "Build an emergency fund equivalent to 3-6 months of your average monthly expenses"
  );

  if (summary.averageTransactionAmount > 1500) {
    recommendations.push(
      "Consider planning larger purchases in advance to avoid impulsive spending decisions"
    );
  }

  return recommendations.slice(0, 3);
};

const generateContextualStrengths = (structuredAnalysis) => {
  const { summary, budgetAnalysis, financialHealth, topSpendingCategories } =
    structuredAnalysis;
  const strengths = [];

  if (summary.totalTransactions > 0) {
    strengths.push("Consistent expense tracking and financial awareness");
  }

  if (budgetAnalysis.length > 0) {
    const goodBudgets = budgetAnalysis.filter(
      (b) => b.status === "GOOD"
    ).length;
    if (goodBudgets > 0) {
      strengths.push(
        `Successfully maintaining ${goodBudgets} budget${
          goodBudgets > 1 ? "s" : ""
        } within limits`
      );
    }
  }

  if (financialHealth.score >= 70) {
    strengths.push("Good overall financial health and expense management");
  }

  if (
    topSpendingCategories.length >= 3 &&
    topSpendingCategories[0].percentage < 60
  ) {
    strengths.push("Well-diversified spending across multiple categories");
  }

  if (strengths.length === 0) {
    strengths.push("Active engagement in expense monitoring");
    strengths.push("Willingness to analyze and improve financial habits");
  }

  return strengths.slice(0, 3);
};

const generateContextualImprovements = (structuredAnalysis) => {
  const { budgetAnalysis, financialHealth, topSpendingCategories, summary } =
    structuredAnalysis;
  const improvements = [];

  const overBudgetCount = budgetAnalysis.filter(
    (b) => b.status === "OVER_BUDGET"
  ).length;
  if (overBudgetCount > 0) {
    improvements.push(
      "Better adherence to budget limits in overspending categories"
    );
  }

  if (financialHealth.score < 70) {
    improvements.push("Overall expense optimization and financial planning");
  }

  if (
    topSpendingCategories.length > 0 &&
    topSpendingCategories[0].percentage > 50
  ) {
    improvements.push(
      `Diversify spending to reduce dependency on ${topSpendingCategories[0].name} category`
    );
  }

  if (budgetAnalysis.length === 0) {
    improvements.push("Implement budgeting system for better expense control");
  }

  if (improvements.length === 0) {
    improvements.push("Fine-tune expense categorization for better insights");
    improvements.push("Develop more proactive spending strategies");
  }

  return improvements.slice(0, 3);
};

const generateContextualBudgetAlert = (budgetAnalysis, aiProvidedAlert) => {
  const overBudgetItems = budgetAnalysis.filter(
    (b) => b.status === "OVER_BUDGET"
  );
  const warningItems = budgetAnalysis.filter((b) => b.status === "WARNING");

  if (overBudgetItems.length > 0) {
    const totalOverage = overBudgetItems.reduce(
      (sum, b) => sum + Math.abs(b.remaining),
      0
    );
    return `${overBudgetItems.length} budget${
      overBudgetItems.length > 1 ? "s" : ""
    } exceeded by total of ₹${totalOverage.toFixed(2)}`;
  }

  if (warningItems.length > 0) {
    return `${warningItems.length} budget${
      warningItems.length > 1 ? "s" : ""
    } approaching limit (over 80% spent)`;
  }

  return null;
};

const generateContextualFallbackInsights = (structuredAnalysis) => {
  return {
    keyInsights: generateContextualKeyInsights(structuredAnalysis),
    spendingBehavior: generateContextualSpendingBehavior(structuredAnalysis),
    recommendations: {
      immediate: generateContextualImmediateRecommendations(structuredAnalysis),
      longTerm: generateContextualLongTermRecommendations(structuredAnalysis),
    },
    strengths: generateContextualStrengths(structuredAnalysis),
    improvements: generateContextualImprovements(structuredAnalysis),
    budgetAlert: generateContextualBudgetAlert(
      structuredAnalysis.budgetAnalysis
    ),
  };
};

const createSimplifiedAnalysisPrompt = (
  structuredAnalysis,
  reportType,
  period
) => {
  const {
    summary,
    topSpendingCategories,
    financialHealth,
    budgetAnalysis,
    spendingPatterns,
  } = structuredAnalysis;

  // Calculate additional context
  const topCategory = topSpendingCategories[0];
  const totalBudgets = budgetAnalysis.length;
  const overBudgetItems = budgetAnalysis.filter(
    (b) => b.status === "OVER_BUDGET"
  );
  const warningBudgetItems = budgetAnalysis.filter(
    (b) => b.status === "WARNING"
  );

  return `You are an expert financial advisor analyzing expense data. Provide specific, actionable insights based on the actual data provided.

FINANCIAL DATA ANALYSIS:
Period: ${reportType} report (${period.start.toDateString()} to ${period.end.toDateString()})
Total Expenses: ₹${summary.totalExpenses.toFixed(2)}
Total Transactions: ${summary.totalTransactions}
Average Daily Spending: ₹${summary.averageDailySpending.toFixed(2)}
Average Transaction Size: ₹${summary.averageTransactionAmount.toFixed(2)}
Financial Health Score: ${financialHealth.score}/100

SPENDING BREAKDOWN:
${topSpendingCategories
  .slice(0, 5)
  .map(
    (cat, index) =>
      `${index + 1}. ${cat.name}: ₹${cat.total.toFixed(
        2
      )} (${cat.percentage.toFixed(1)}%) - ${cat.count} transactions`
  )
  .join("\n")}

BUDGET PERFORMANCE:
${
  totalBudgets > 0
    ? `
Total Budgets: ${totalBudgets}
Over Budget: ${overBudgetItems.length} ${
        overBudgetItems.length > 0
          ? `(${overBudgetItems.map((b) => b.categoryName).join(", ")})`
          : ""
      }
Warning Status: ${warningBudgetItems.length} ${
        warningBudgetItems.length > 0
          ? `(${warningBudgetItems.map((b) => b.categoryName).join(", ")})`
          : ""
      }
Within Budget: ${budgetAnalysis.filter((b) => b.status === "GOOD").length}
`
    : "No active budgets set"
}

SPENDING PATTERNS:
Most expensive day: ${
    spendingPatterns.peakSpendingDays[0]?.dayName || "N/A"
  } - ₹${spendingPatterns.peakSpendingDays[0]?.amount?.toFixed(2) || "0"}
Top spending day of week: ${spendingPatterns.dayOfWeekAnalysis.topSpendingDay}
Active spending days: ${spendingPatterns.totalSpendingDays} out of ${
    summary.periodDays
  }

Based on this specific data, provide a JSON response with your analysis. Focus on the actual numbers and patterns shown above.

Required JSON format:
{
  "keyInsights": [3-4 specific insights based on the actual data],
  "spendingBehavior": "description based on actual spending patterns and amounts",
  "recommendations": {
    "immediate": [2-3 specific actions based on the data],
    "longTerm": [2-3 strategic recommendations]
  },
  "strengths": [2-3 positive financial behaviors identified],
  "improvements": [2-3 specific areas for improvement],
  "budgetAlert": "specific alert message if budget issues exist, otherwise null"
}

Analyze the specific data provided and give actionable insights. Do not use generic responses.`;
};

const calculateFinancialHealthScore = (data) => {
  let score = 70;

  const {
    totalExpenses,
    totalTransactions,
    categoryBreakdown,
    budgetAnalysis,
  } = data;

  if (budgetAnalysis.length > 0) {
    const overBudgetCount = budgetAnalysis.filter(
      (b) => b.status === "OVER_BUDGET"
    ).length;
    const budgetAdherence = 1 - overBudgetCount / budgetAnalysis.length;
    score += budgetAdherence * 30 - 15;
  }

  const categoryValues = Object.values(categoryBreakdown);
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

  const avgTransactionAmount = totalExpenses / (totalTransactions || 1);
  if (avgTransactionAmount < 500) {
    score += 5;
  } else if (avgTransactionAmount > 2000) {
    score -= 5;
  }

  return Math.max(1, Math.min(100, Math.round(score)));
};

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

  return { expenses, budgets, period };
};

const generateStructuredAnalysis = (expenses, budgets, period) => {
  const totalExpenses = expenses.reduce(
    (sum, exp) => sum + parseFloat(exp.amount),
    0
  );
  const totalTransactions = expenses.length;

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

  Object.keys(categoryBreakdown).forEach((category) => {
    categoryBreakdown[category].percentage =
      totalExpenses > 0
        ? (categoryBreakdown[category].total / totalExpenses) * 100
        : 0;
  });

  const paymentMethodBreakdown = expenses.reduce((acc, expense) => {
    const method = expense.payment_method;
    if (!acc[method]) {
      acc[method] = { total: 0, count: 0 };
    }
    acc[method].total += parseFloat(expense.amount);
    acc[method].count += 1;
    return acc;
  }, {});

  const dailySpending = expenses.reduce((acc, expense) => {
    const date = expense.expense_date.toISOString().split("T")[0];
    if (!acc[date]) {
      acc[date] = 0;
    }
    acc[date] += parseFloat(expense.amount);
    return acc;
  }, {});

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
      budgetId: budget.budget_id,
      budgetName: budget.name,
      categoryId: budget.category_id,
      categoryName: budget.category?.name || "All Categories",
      limit: parseFloat(budget.amount_limit),
      spent: spent,
      remaining: parseFloat(budget.amount_limit) - spent,
      percentage: percentage,
      status:
        percentage > 100 ? "OVER_BUDGET" : percentage > 80 ? "WARNING" : "GOOD",
    };
  });

  const financialHealthScore = calculateFinancialHealthScore({
    totalExpenses,
    totalTransactions,
    categoryBreakdown,
    budgetAnalysis,
  });

  const spendingPatterns = analyzeSpendingPatterns(dailySpending);

  const topSpendingCategories = Object.entries(categoryBreakdown)
    .sort(([, a], [, b]) => b.total - a.total)
    .slice(0, 5)
    .map(([category, data]) => ({
      name: category,
      total: data.total,
      percentage: data.percentage,
      count: data.count,
    }));

  return {
    summary: {
      totalExpenses,
      totalTransactions,
      averageDailySpending:
        totalExpenses / (Object.keys(dailySpending).length || 1),
      averageTransactionAmount: totalExpenses / (totalTransactions || 1),
      periodDays: Object.keys(dailySpending).length,
    },
    categoryBreakdown,
    paymentMethodBreakdown,
    dailySpending,
    budgetAnalysis,
    topSpendingCategories,
    spendingPatterns,
    financialHealth: {
      score: financialHealthScore,
      budgetPerformance: {
        totalBudgets: budgetAnalysis.length,
        overBudgetCount: budgetAnalysis.filter(
          (b) => b.status === "OVER_BUDGET"
        ).length,
        warningBudgetCount: budgetAnalysis.filter((b) => b.status === "WARNING")
          .length,
        goodBudgetCount: budgetAnalysis.filter((b) => b.status === "GOOD")
          .length,
      },
    },
    expenses: expenses.map((exp) => ({
      id: exp.expense_id,
      amount: parseFloat(exp.amount),
      category: exp.category?.name || "Uncategorized",
      description: exp.description,
      date: exp.expense_date,
      paymentMethod: exp.payment_method,
      merchantName: exp.merchant_name,
    })),
    period,
  };
};

const generateSimplifiedAIInsights = async (
  structuredAnalysis,
  reportType,
  period
) => {
  const prompt = createSimplifiedAnalysisPrompt(
    structuredAnalysis,
    reportType,
    period
  );

  try {
    const command = new InvokeModelCommand({
      modelId: TITAN_MODEL_ID,
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify({
        inputText: prompt,
        textGenerationConfig: {
          maxTokenCount: 3000,
          temperature: 0.4,
          topP: 0.8,
          stopSequences: [],
        },
      }),
    });

    const response = await bedrockClient.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));

    const generatedText = responseBody.results[0].outputText;

    // Enhanced JSON extraction
    const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsedInsights = JSON.parse(jsonMatch[0]);

        return validateAndEnhanceAIInsights(parsedInsights, structuredAnalysis);
      } catch (parseError) {
        logger.warn("Failed to parse AI insights JSON:", parseError);
        return generateContextualFallbackInsights(structuredAnalysis);
      }
    } else {
      logger.warn(
        "No valid JSON found in Titan response, using contextual fallback"
      );
      return generateContextualFallbackInsights(structuredAnalysis);
    }
  } catch (error) {
    logger.error("Error generating AI insights:", error);
    return generateContextualFallbackInsights(structuredAnalysis);
  }
};

module.exports = {
  calculateReportPeriod,
  gatherReportData,
  generateStructuredAnalysis,
  generateSimplifiedAIInsights,
};
