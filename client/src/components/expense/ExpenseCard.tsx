import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MoreHorizontal,
  Edit,
  Trash2,
  MapPin,
  Calendar,
  CreditCard,
  Banknote,
  Building2,
  Smartphone,
  FileText,
  Wallet,
  HelpCircle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import type { Expense } from "@/types";

interface ExpenseCardProps {
  expense: Expense;
  onEdit: (expense: Expense) => void;
  onDelete: (expenseId: string) => void;
}

export function ExpenseCard({ expense, onEdit, onDelete }: ExpenseCardProps) {
  const formatCurrency = (amount: string | number) => {
    const numericAmount =
      typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: expense.currency || "INR",
    }).format(numericAmount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-100 text-green-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case "CASH":
        return <Banknote className="w-3 h-3" />;
      case "CREDIT_CARD":
      case "DEBIT_CARD":
        return <CreditCard className="w-3 h-3" />;
      case "BANK_TRANSFER":
        return <Building2 className="w-3 h-3" />;
      case "UPI":
        return <Smartphone className="w-3 h-3" />;
      case "CHEQUE":
        return <FileText className="w-3 h-3" />;
      case "WALLET":
        return <Wallet className="w-3 h-3" />;
      case "OTHER":
        return <HelpCircle className="w-3 h-3" />;
      default:
        return <HelpCircle className="w-3 h-3" />;
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              {expense.category?.icon ? (
                <CategoryIcon
                  iconName={expense.category.icon}
                  className="w-5 h-5 text-blue-600"
                />
              ) : (
                <span className="text-lg">💰</span>
              )}
            </div>
            <div>
              <h3 className="font-semibold text-lg">{expense.description}</h3>
              <p className="text-sm text-gray-600">
                {expense.category?.name || "Uncategorized"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge className={getStatusColor(expense.status)}>
              {expense.status}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(expense)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDelete(expense.expense_id)}
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
        {/* Amount */}
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(expense.amount)}
          </p>
        </div>

        {/* Merchant & Payment Method */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1">
            {getPaymentMethodIcon(expense.payment_method)}
            <span className="text-sm text-gray-600">
              {expense.merchant_name}
            </span>
          </div>
          <Badge variant="outline" className="text-xs">
            {expense.payment_method.replace("_", " ")}
          </Badge>
        </div>

        {/* Date & Time */}
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <Calendar className="w-3 h-3" />
          <span>{formatDate(expense.expense_date)}</span>
          <span className="text-gray-400">•</span>
          <span>{formatTime(expense.expense_date)}</span>
        </div>

        {/* Location */}
        {expense.location && (
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <MapPin className="w-3 h-3" />
            <span className="truncate">{expense.location.address}</span>
          </div>
        )}

        {/* Notes */}
        {expense.notes && (
          <div className="pt-2 border-t">
            <p className="text-sm text-gray-600 italic">"{expense.notes}"</p>
          </div>
        )}

        {/* Verification Status */}
        <div className="flex justify-between items-center pt-2 border-t">
          <span className="text-xs text-gray-500">
            {expense.is_verified ? "✓ Verified" : "⏳ Pending verification"}
          </span>
          <span className="text-xs text-gray-500">
            {formatDate(expense.createdAt)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
