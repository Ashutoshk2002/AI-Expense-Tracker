import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  CreditCard,
  Calendar,
} from "lucide-react";
import { useBudgets } from "@/services/budget";
import { useExpenses } from "@/services/expense";

export function OverviewStats() {
  const { data: budgetsResponse } = useBudgets();
  const { data: expensesResponse } = useExpenses();

  const budgets = budgetsResponse?.data || [];
  const expenses = expensesResponse?.data || [];

  // Calculate stats
  const totalBudgets = budgets.length;
  const activeBudgets = budgets.filter((b) => b.is_active).length;
  const totalBudgetLimit = budgets.reduce(
    (sum, b) => sum + parseFloat(b.amount_limit),
    0
  );
  const totalSpent = budgets.reduce(
    (sum, b) => sum + parseFloat(b.current_spent),
    0
  );

  const thisMonthExpenses = expenses.filter((e) => {
    const expenseDate = new Date(e.expense_date);
    const now = new Date();
    return (
      expenseDate.getMonth() === now.getMonth() &&
      expenseDate.getFullYear() === now.getFullYear()
    );
  });

  const thisMonthTotal = thisMonthExpenses.reduce(
    (sum, e) => sum + parseFloat(e.amount),
    0
  );
  const averageExpense =
    thisMonthExpenses.length > 0
      ? thisMonthTotal / thisMonthExpenses.length
      : 0;

  const budgetUtilization =
    totalBudgetLimit > 0 ? (totalSpent / totalBudgetLimit) * 100 : 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const stats = [
    {
      title: "Total Budget",
      value: formatCurrency(totalBudgetLimit),
      description: `${activeBudgets} active budgets`,
      icon: Target,
      trend: totalBudgets > 0 ? "positive" : "neutral",
    },
    {
      title: "Total Spent",
      value: formatCurrency(totalSpent),
      description: `${budgetUtilization.toFixed(1)}% of budget used`,
      icon: DollarSign,
      trend:
        budgetUtilization > 80
          ? "negative"
          : budgetUtilization > 60
          ? "warning"
          : "positive",
    },
    {
      title: "This Month",
      value: formatCurrency(thisMonthTotal),
      description: `${thisMonthExpenses.length} transactions`,
      icon: Calendar,
      trend: "neutral",
    },
    {
      title: "Average Expense",
      value: formatCurrency(averageExpense),
      description: "Per transaction",
      icon: CreditCard,
      trend: "neutral",
    },
  ];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "positive":
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case "negative":
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "positive":
        return "text-green-600";
      case "negative":
        return "text-red-600";
      case "warning":
        return "text-yellow-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent opacity-50" />
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-100 to-transparent rounded-full transform translate-x-6 -translate-y-6" />

            <CardHeader className="relative z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-lg font-semibold text-gray-700">
                    {stat.title}
                  </CardTitle>
                </div>
              </div>
            </CardHeader>

            <CardContent className="relative z-10">
              <div className="space-y-3">
                <div className="text-4xl font-bold text-gray-900 tracking-tight">
                  {stat.value}
                </div>
                <div
                  className={`flex items-center gap-2 text-sm font-medium ${getTrendColor(
                    stat.trend
                  )}`}
                >
                  {getTrendIcon(stat.trend)}
                  <span>{stat.description}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
