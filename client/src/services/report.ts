import { useMutation, useQuery } from "@tanstack/react-query";
import type {
  ApiResponse,
  GenerateReportData,
  GenerateReportResponse,
  Report,
} from "@/types";

// Hardcoded responses as requested since AWS Bedrock isn't working
const MOCK_GENERATE_RESPONSE: ApiResponse<GenerateReportResponse> = {
  statusCode: 200,
  data: {
    reportId: "a6132619-af4f-424a-9934-0089b7c05908",
  },
  message: "Report generated and sent successfully",
  success: true,
  errors: null,
};

const MOCK_REPORT_DATA: ApiResponse<Report> = {
  statusCode: 200,
  data: {
    report_id: "5b4b80f1-5718-4de7-b51a-c5210e08ab1d",
    user_id: "5d4eda7e-a244-47f9-a330-6892dd9f196f",
    report_type: "CUSTOM",
    title: "CUSTOM Expense Report",
    period_start: "2025-06-01T00:00:00.000Z",
    period_end: "2025-06-30T23:59:59.000Z",
    total_expenses: "4850.75",
    total_transactions: 3,
    report_data: null,
    structured_analysis: {
      period: {
        end: "2025-06-30T23:59:59.000Z",
        start: "2025-06-01T00:00:00.000Z",
      },
      summary: {
        periodDays: 3,
        totalExpenses: 4850.75,
        totalTransactions: 3,
        averageDailySpending: 1616.9166666666667,
        averageTransactionAmount: 1616.9166666666667,
      },
      expenses: [
        {
          id: "70df6d60-884e-4e48-87ae-d77d1912b9da",
          date: "2025-06-10T15:00:00.000Z",
          amount: 3200,
          category: "Shopping",
          description: "Clothes shopping",
          merchantName: "H&M",
          paymentMethod: "CREDIT_CARD",
        },
        {
          id: "3b0628be-1821-4ca2-af33-ae0727518a27",
          date: "2025-06-05T12:30:00.000Z",
          amount: 450.75,
          category: "Food",
          description: "Lunch with friends",
          merchantName: "Zomato",
          paymentMethod: "UPI",
        },
        {
          id: "a8d770a3-7fd0-43a8-a45d-97a8ad8074fe",
          date: "2025-06-02T09:00:00.000Z",
          amount: 1200,
          category: "Bills",
          description: "Electricity bill",
          merchantName: "MSEB",
          paymentMethod: "BANK_TRANSFER",
        },
      ],
      dailySpending: {
        "2025-06-02": 1200,
        "2025-06-05": 450.75,
        "2025-06-10": 3200,
      },
      budgetAnalysis: [
        {
          limit: 2000,
          spent: 1200,
          status: "GOOD",
          budgetId: "4d094701-3c04-44da-b704-32830bcd092a",
          remaining: 800,
          budgetName: "Bills Budget - June",
          categoryId: "885db381-0d25-4418-aaaf-daf389bd0fe8",
          percentage: 60,
          categoryName: "Bills",
        },
        {
          limit: 6000,
          spent: 450.75,
          status: "GOOD",
          budgetId: "71d7f9a2-7b77-43fa-85ac-3fbca73650e1",
          remaining: 5549.25,
          budgetName: "Food Budget - June",
          categoryId: "ca224b0d-f2ec-418a-ba22-a6e9b3ffefa1",
          percentage: 7.512499999999999,
          categoryName: "Food",
        },
        {
          limit: 5000,
          spent: 3200,
          status: "GOOD",
          budgetId: "c520068a-dcd0-431d-ad63-2f6cdee5b08e",
          remaining: 1800,
          budgetName: "Shopping Budget - June",
          categoryId: "49ebdca6-c0c7-473a-8496-79f1e2f4cf5c",
          percentage: 64,
          categoryName: "Shopping",
        },
      ],
      financialHealth: {
        score: 85,
        budgetPerformance: {
          totalBudgets: 3,
          goodBudgetCount: 3,
          overBudgetCount: 0,
          warningBudgetCount: 0,
        },
      },
      spendingPatterns: {
        peakSpendingDays: [
          {
            date: "2025-06-10",
            amount: 3200,
            dayName: "Tuesday",
          },
          {
            date: "2025-06-02",
            amount: 1200,
            dayName: "Monday",
          },
          {
            date: "2025-06-05",
            amount: 450.75,
            dayName: "Thursday",
          },
        ],
        dayOfWeekAnalysis: {
          breakdown: [
            {
              day: "Monday",
              amount: 1200,
            },
            {
              day: "Tuesday",
              amount: 3200,
            },
            {
              day: "Thursday",
              amount: 450.75,
            },
          ],
          topSpendingDay: "Tuesday",
          topSpendingAmount: 3200,
        },
        totalSpendingDays: 3,
        averageSpendingPerDay: 1616.9166666666667,
      },
      categoryBreakdown: {
        Food: {
          count: 1,
          total: 450.75,
          percentage: 9.292377467401948,
        },
        Bills: {
          count: 1,
          total: 1200,
          percentage: 24.738442508890376,
        },
        Shopping: {
          count: 1,
          total: 3200,
          percentage: 65.96918002370768,
        },
      },
      topSpendingCategories: [
        {
          name: "Shopping",
          count: 1,
          total: 3200,
          percentage: 65.96918002370768,
        },
        {
          name: "Bills",
          count: 1,
          total: 1200,
          percentage: 24.738442508890376,
        },
        {
          name: "Food",
          count: 1,
          total: 450.75,
          percentage: 9.292377467401948,
        },
      ],
      paymentMethodBreakdown: {
        UPI: {
          count: 1,
          total: 450.75,
        },
        CREDIT_CARD: {
          count: 1,
          total: 3200,
        },
        BANK_TRANSFER: {
          count: 1,
          total: 1200,
        },
      },
    },
    ai_insights: {
      strengths: [
        "Consistent expense tracking and financial awareness",
        "Successfully maintaining 3 budgets within limits",
        "Good overall financial health and expense management",
      ],
      budgetAlert: null,
      keyInsights: [
        "Total Expenses: ₹4850.75, Total Transactions: 3, Average Daily Spending: ₹1616.92, Average Transaction Size: ₹1616.92",
        "Financial Health Score: 85/100",
        "Spending Breakdown: 1. Shopping: ₹3200.00 (66.0%), 2. Bills: ₹1200.00 (24.7%), 3. Food: ₹450.75 (9.3%)",
        "Budget Performance: Total Budgets: 3, Over Budget: 0, Warning Status: 0, Within Budget: 3",
        "Spending Patterns: Most expensive day: Tuesday - ₹3200.00, Top spending day of week: Tuesday, Active spending days: 3 out of 3",
        "Recommendations: 2-3 specific actions based on the data",
        "Strengths: 2-3 positive financial behaviors identified",
        "Improvements: 2-3 specific areas for improvement",
        "BudgetAlert: 2-3 specific alert message if budget issues exist, otherwise null",
      ],
      improvements: [
        "Diversify spending to reduce dependency on Shopping category",
      ],
      recommendations: {
        longTerm: [
          "Build an emergency fund equivalent to 3-6 months of your average monthly expenses",
          "Consider planning larger purchases in advance to avoid impulsive spending decisions",
        ],
        immediate: [
          "Consider ways to reduce Shopping expenses, which represent 66.0% of your total spending",
        ],
      },
      spendingBehavior:
        "Your spending shows moderate transaction sizes averaging ₹1616.92 spread across 3 days. Your expenses are concentrated in fewer categories.",
    },
    status: "COMPLETED",
    email_sent: true,
    email_sent_at: "2025-06-29T06:11:13.000Z",
    createdAt: "2025-06-29T06:10:48.000Z",
    updatedAt: "2025-06-29T06:11:13.000Z",
    user: {
      user_id: "5d4eda7e-a244-47f9-a330-6892dd9f196f",
      email: "ashutoshkhairnar1966@gmail.com",
      name: "Ashutosh",
    },
  },
  message: "Report fetched successfully.",
  success: true,
  errors: null,
};

// Report API functions (using mock data for now)
export const generateReport = async (
  data: GenerateReportData
): Promise<ApiResponse<GenerateReportResponse>> => {
  // TODO: Use data when implementing actual API call
  console.log("Generate report data:", data);
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return MOCK_GENERATE_RESPONSE;
};

export const getReport = async (
  reportId: string
): Promise<ApiResponse<Report>> => {
  // TODO: Use reportId when implementing actual API call
  console.log("Get report ID:", reportId);
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1500));
  return MOCK_REPORT_DATA;
};

// TanStack Query hooks
export const useGenerateReport = () => {
  return useMutation({
    mutationFn: generateReport,
  });
};

export const useReport = (reportId: string) => {
  return useQuery({
    queryKey: ["report", reportId],
    queryFn: () => getReport(reportId),
    enabled: !!reportId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};
