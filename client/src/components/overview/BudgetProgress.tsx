import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { Badge } from "@/components/ui/badge";
import { ArrowRight, Target, TrendingUp, TrendingDown } from "lucide-react";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { useBudgets } from "@/services/budget";
import type { Budget } from "@/types";

interface BudgetProgressProps {
  onViewAll?: () => void;
}

export function BudgetProgress({ onViewAll }: BudgetProgressProps) {
  const { data: budgetsResponse, isLoading } = useBudgets();

  const budgets = budgetsResponse?.data || [];
  const activeBudgets = budgets
    .filter((budget) => budget.is_active)
    .sort((a, b) => {
      // Sort by progress percentage (highest first)
      const progressA =
        (parseFloat(a.current_spent) / parseFloat(a.amount_limit)) * 100;
      const progressB =
        (parseFloat(b.current_spent) / parseFloat(b.amount_limit)) * 100;
      return progressB - progressA;
    })
    .slice(0, 4); // Show top 4 budgets

  const formatCurrency = (amount: string | number) => {
    const numericAmount =
      typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(numericAmount);
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return "bg-red-500";
    if (percentage >= 75) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getStatusBadge = (percentage: number) => {
    if (percentage >= 100) {
      return (
        <Badge className="bg-red-100 text-red-800 text-xs">
          <TrendingDown className="w-3 h-3 mr-1" />
          Over Budget
        </Badge>
      );
    }
    if (percentage >= 75) {
      return (
        <Badge className="bg-yellow-100 text-yellow-800 text-xs">
          <TrendingUp className="w-3 h-3 mr-1" />
          High Usage
        </Badge>
      );
    }
    return (
      <Badge className="bg-green-100 text-green-800 text-xs">On Track</Badge>
    );
  };

  const getRemainingDays = (budget: Budget) => {
    if (!budget.period_end) return null;

    const endDate = new Date(budget.period_end);
    const now = new Date();
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return "Expired";
    if (diffDays === 0) return "Ends today";
    if (diffDays === 1) return "1 day left";
    return `${diffDays} days left`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            Budget Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-gray-200 rounded-lg" />
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-24 mb-1" />
                    <div className="h-3 bg-gray-200 rounded w-16" />
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">Budget Progress</CardTitle>
        {onViewAll && (
          <Button variant="ghost" size="sm" onClick={onViewAll}>
            View All
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {activeBudgets.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Target className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No active budgets</p>
            <p className="text-sm">Create budgets to track your spending</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeBudgets.map((budget: Budget) => {
              const spent = parseFloat(budget.current_spent);
              const limit = parseFloat(budget.amount_limit);
              const percentage = (spent / limit) * 100;
              const remaining = limit - spent;
              const remainingDays = getRemainingDays(budget);

              return (
                <div key={budget.budget_id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        {budget.category?.icon ? (
                          <CategoryIcon
                            iconName={budget.category.icon}
                            className="w-4 h-4 text-blue-600"
                          />
                        ) : (
                          <Target className="w-4 h-4 text-blue-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{budget.name}</p>
                        <p className="text-xs text-gray-500">
                          {budget.category?.name || "No category"}{" "}
                          {remainingDays && `• ${remainingDays}`}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(percentage)}
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>
                        {formatCurrency(spent)} of {formatCurrency(limit)}
                      </span>
                      <span>{percentage.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(
                          percentage
                        )}`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">
                        {remaining > 0 ? "Remaining" : "Over by"}
                      </span>
                      <span
                        className={
                          remaining > 0 ? "text-green-600" : "text-red-600"
                        }
                      >
                        {formatCurrency(Math.abs(remaining))}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
