import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp,
  DollarSign,
  Calendar,
  Target,
  Brain,
  CheckCircle,
  AlertCircle,
  Lightbulb,
  Star,
  CreditCard,
  BarChart3,
  PieChart,
} from "lucide-react";
import { useReport } from "@/services/report";
import type { Report } from "@/types";

interface ReportDisplayProps {
  reportId: string;
}

export function ReportDisplay({ reportId }: ReportDisplayProps) {
  const { data: reportResponse, isLoading, error } = useReport(reportId);

  if (isLoading) {
    return <ReportSkeleton />;
  }

  if (error || !reportResponse?.data) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <AlertCircle className="w-12 h-12 mx-auto mb-3 text-red-400" />
          <p className="text-red-600">Failed to load report</p>
        </CardContent>
      </Card>
    );
  }

  const report = reportResponse.data;

  return (
    <div className="space-y-6">
      {/* Report Header */}
      <ReportHeader report={report} />

      {/* Summary Stats */}
      <SummaryStats report={report} />

      {/* Grid Layout for Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Financial Health */}
        <FinancialHealthCard report={report} />

        {/* Category Breakdown */}
        <CategoryBreakdownCard report={report} />

        {/* Budget Analysis */}
        <BudgetAnalysisCard report={report} />

        {/* Payment Methods */}
        <PaymentMethodsCard report={report} />
      </div>

      {/* Spending Patterns */}
      <SpendingPatternsCard report={report} />

      {/* AI Insights */}
      <AIInsightsCard report={report} />
    </div>
  );
}

function ReportHeader({ report }: { report: Report }) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatCurrency = (amount: string | number) => {
    const numericAmount =
      typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(numericAmount);
  };

  return (
    <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold">{report.title}</CardTitle>
            <p className="text-purple-100 mt-1">
              {formatDate(report.period_start)} -{" "}
              {formatDate(report.period_end)}
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">
              {formatCurrency(report.total_expenses)}
            </div>
            <p className="text-purple-100">
              {report.total_transactions} transactions
            </p>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}

function SummaryStats({ report }: { report: Report }) {
  const { summary } = report.structured_analysis;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const stats = [
    {
      title: "Period Days",
      value: summary.periodDays.toString(),
      icon: Calendar,
      color: "bg-blue-500",
    },
    {
      title: "Total Expenses",
      value: formatCurrency(summary.totalExpenses),
      icon: DollarSign,
      color: "bg-green-500",
    },
    {
      title: "Daily Average",
      value: formatCurrency(summary.averageDailySpending),
      icon: TrendingUp,
      color: "bg-orange-500",
    },
    {
      title: "Per Transaction",
      value: formatCurrency(summary.averageTransactionAmount),
      icon: CreditCard,
      color: "bg-purple-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center`}
                >
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">{stat.title}</p>
                  <p className="text-xl font-bold">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function FinancialHealthCard({ report }: { report: Report }) {
  const { financialHealth } = report.structured_analysis;
  const score = financialHealth.score;

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5" />
          Financial Health Score
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className={`text-6xl font-bold ${getScoreColor(score)}`}>
            {score}
            <span className="text-2xl">/100</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 mt-3">
            <div
              className={`h-3 rounded-full ${getScoreBg(
                score
              )} transition-all duration-500`}
              style={{ width: `${score}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {financialHealth.budgetPerformance.goodBudgetCount}
            </div>
            <p className="text-sm text-gray-600">Good Budgets</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {financialHealth.budgetPerformance.overBudgetCount}
            </div>
            <p className="text-sm text-gray-600">Over Budget</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function CategoryBreakdownCard({ report }: { report: Report }) {
  const { topSpendingCategories } = report.structured_analysis;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PieChart className="w-5 h-5" />
          Category Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {topSpendingCategories.map((category, index) => (
          <div key={index} className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-medium">{category.name}</span>
              <div className="text-right">
                <div className="font-bold">
                  {formatCurrency(category.total)}
                </div>
                <div className="text-sm text-gray-500">
                  {category.percentage.toFixed(1)}%
                </div>
              </div>
            </div>
            <Progress value={category.percentage} className="h-2" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function BudgetAnalysisCard({ report }: { report: Report }) {
  const { budgetAnalysis } = report.structured_analysis;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "GOOD":
        return "bg-green-100 text-green-800";
      case "WARNING":
        return "bg-yellow-100 text-yellow-800";
      case "OVER":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Budget Performance
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {budgetAnalysis.map((budget, index) => (
          <div key={index} className="space-y-2">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">{budget.budgetName}</p>
                <p className="text-sm text-gray-500">{budget.categoryName}</p>
              </div>
              <Badge className={getStatusColor(budget.status)}>
                {budget.status}
              </Badge>
            </div>
            <div className="flex justify-between text-sm">
              <span>
                {formatCurrency(budget.spent)} of {formatCurrency(budget.limit)}
              </span>
              <span>{budget.percentage.toFixed(1)}%</span>
            </div>
            <Progress value={budget.percentage} className="h-2" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function PaymentMethodsCard({ report }: { report: Report }) {
  const { paymentMethodBreakdown } = report.structured_analysis;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Payment Methods
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {Object.entries(paymentMethodBreakdown).map(([method, data]) => (
          <div key={method} className="flex justify-between items-center">
            <span className="font-medium">{method.replace("_", " ")}</span>
            <div className="text-right">
              <div className="font-bold">{formatCurrency(data.total)}</div>
              <div className="text-sm text-gray-500">
                {data.count} transaction{data.count !== 1 ? "s" : ""}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function SpendingPatternsCard({ report }: { report: Report }) {
  const { spendingPatterns } = report.structured_analysis;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Spending Patterns
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Peak Spending Days */}
          <div>
            <h4 className="font-semibold mb-3">Peak Spending Days</h4>
            <div className="space-y-2">
              {spendingPatterns.peakSpendingDays
                .slice(0, 3)
                .map((day, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center"
                  >
                    <span className="text-sm">
                      {day.dayName} ({new Date(day.date).toLocaleDateString()})
                    </span>
                    <span className="font-medium">
                      {formatCurrency(day.amount)}
                    </span>
                  </div>
                ))}
            </div>
          </div>

          {/* Day of Week Analysis */}
          <div>
            <h4 className="font-semibold mb-3">Weekly Pattern</h4>
            <div className="space-y-2">
              {spendingPatterns.dayOfWeekAnalysis.breakdown.map(
                (day, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center"
                  >
                    <span className="text-sm">{day.day}</span>
                    <span className="font-medium">
                      {formatCurrency(day.amount)}
                    </span>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function AIInsightsCard({ report }: { report: Report }) {
  const { ai_insights } = report;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5" />
          AI-Powered Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Strengths */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Star className="w-4 h-4 text-green-600" />
            <h4 className="font-semibold text-green-600">Strengths</h4>
          </div>
          <ul className="space-y-1">
            {ai_insights.strengths.map((strength, index) => (
              <li key={index} className="text-sm flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                {strength}
              </li>
            ))}
          </ul>
        </div>

        {/* Improvements */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-orange-600" />
            <h4 className="font-semibold text-orange-600">
              Areas for Improvement
            </h4>
          </div>
          <ul className="space-y-1">
            {ai_insights.improvements.map((improvement, index) => (
              <li key={index} className="text-sm flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                {improvement}
              </li>
            ))}
          </ul>
        </div>

        {/* Recommendations */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-4 h-4 text-blue-600" />
            <h4 className="font-semibold text-blue-600">Recommendations</h4>
          </div>

          <div className="space-y-3">
            <div>
              <h5 className="text-sm font-medium text-gray-700 mb-1">
                Immediate Actions
              </h5>
              <ul className="space-y-1">
                {ai_insights.recommendations.immediate.map((rec, index) => (
                  <li
                    key={index}
                    className="text-sm text-gray-600 flex items-start gap-2"
                  >
                    <span className="text-blue-500 mt-1">•</span>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h5 className="text-sm font-medium text-gray-700 mb-1">
                Long-term Goals
              </h5>
              <ul className="space-y-1">
                {ai_insights.recommendations.longTerm.map((rec, index) => (
                  <li
                    key={index}
                    className="text-sm text-gray-600 flex items-start gap-2"
                  >
                    <span className="text-blue-500 mt-1">•</span>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Spending Behavior */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-semibold text-gray-700 mb-2">
            Spending Behavior Analysis
          </h4>
          <p className="text-sm text-gray-600">
            {ai_insights.spendingBehavior}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function ReportSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-2" />
          <div className="h-4 bg-gray-200 rounded w-1/4" />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4 animate-pulse">
              <div className="h-16 bg-gray-200 rounded" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6 animate-pulse">
              <div className="h-32 bg-gray-200 rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
