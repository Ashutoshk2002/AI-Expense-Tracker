import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  MoreHorizontal,
  Edit,
  Trash2,
  Calendar,
  DollarSign,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import type { Budget } from "@/types";

interface BudgetCardProps {
  budget: Budget;
  onEdit: (budget: Budget) => void;
  onDelete: (budgetId: string) => void;
}

export function BudgetCard({ budget, onEdit, onDelete }: BudgetCardProps) {
  const progressPercentage = budget.progress_percentage || 0;
  const remainingAmount = budget.remaining_amount || 0;
  const daysRemaining = budget.days_remaining || 0;

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return "bg-red-500";
    if (percentage >= 75) return "bg-yellow-500";
    return "bg-green-500";
  };

  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(typeof amount === "string" ? parseFloat(amount) : amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <CategoryIcon
                iconName={budget.category.icon}
                className="w-5 h-5 text-blue-600"
              />
            </div>
            <div>
              <CardTitle className="text-lg">{budget.name}</CardTitle>
              <p className="text-sm text-gray-600">{budget.category.name}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant={budget.is_active ? "default" : "secondary"}>
              {budget.is_active ? "Active" : "Inactive"}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(budget)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDelete(budget.budget_id)}
                  className="text-red-600"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Budget Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Progress</span>
            <span className="font-medium">
              {progressPercentage.toFixed(1)}%
            </span>
          </div>
          <Progress
            value={progressPercentage}
            className={`h-2 ${getProgressColor(progressPercentage)}`}
          />
        </div>

        {/* Financial Info */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-gray-600">
              <DollarSign className="w-3 h-3" />
              <span className="text-xs">Spent</span>
            </div>
            <p className="font-semibold text-lg">
              {formatCurrency(budget.current_spent)}
            </p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-gray-600">
              <DollarSign className="w-3 h-3" />
              <span className="text-xs">Remaining</span>
            </div>
            <p className="font-semibold text-lg text-green-600">
              {formatCurrency(remainingAmount)}
            </p>
          </div>
        </div>

        {/* Period Info */}
        <div className="flex justify-between items-center pt-2 border-t">
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <Calendar className="w-3 h-3" />
            <span>
              {formatDate(budget.period_start)} -{" "}
              {formatDate(budget.period_end)}
            </span>
          </div>
          <Badge variant="outline" className="text-xs">
            {daysRemaining} days left
          </Badge>
        </div>

        {/* Budget Limit */}
        <div className="text-center pt-2 border-t">
          <p className="text-xs text-gray-600">Budget Limit</p>
          <p className="text-xl font-bold">
            {formatCurrency(budget.amount_limit)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
