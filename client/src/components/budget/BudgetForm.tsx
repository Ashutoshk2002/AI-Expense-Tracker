import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Loader2, Calendar } from "lucide-react";
import { useCategories } from "@/services/category";
import { useCreateBudget, useUpdateBudget } from "@/services/budget";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import type { Budget, BudgetPeriod, CreateBudgetData } from "@/types";

interface BudgetFormProps {
  isOpen: boolean;
  onClose: () => void;
  budget?: Budget; // If provided, we're editing
}

export function BudgetForm({ isOpen, onClose, budget }: BudgetFormProps) {
  const [formData, setFormData] = useState<CreateBudgetData>({
    category_id: "",
    name: "",
    amount_limit: 0,
    budget_period: "MONTHLY",
    period_start: "",
    is_active: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: categoriesResponse, isLoading: categoriesLoading } =
    useCategories();
  const createBudgetMutation = useCreateBudget();
  const updateBudgetMutation = useUpdateBudget();

  const isEditing = !!budget;
  const isLoading =
    createBudgetMutation.isPending || updateBudgetMutation.isPending;

  useEffect(() => {
    if (budget) {
      setFormData({
        category_id: budget.category_id,
        name: budget.name,
        amount_limit: parseFloat(budget.amount_limit),
        budget_period: budget.budget_period,
        period_start: budget.period_start.split("T")[0], // Convert to date input format
        is_active: budget.is_active,
      });
    } else {
      // Reset form for new budget
      const today = new Date();

      setFormData({
        category_id: "",
        name: "",
        amount_limit: 0,
        budget_period: "MONTHLY",
        period_start: today.toISOString().split("T")[0],
        is_active: true,
      });
    }
    setErrors({});
  }, [budget, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.category_id) {
      newErrors.category_id = "Category is required";
    }
    if (!formData.name.trim()) {
      newErrors.name = "Budget name is required";
    }
    if (formData.name.length > 100) {
      newErrors.name = "Budget name must be at most 100 characters";
    }
    if (formData.amount_limit <= 0) {
      newErrors.amount_limit = "Amount limit must be a positive number";
    }
    if (!formData.period_start) {
      newErrors.period_start = "Period start is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    // Convert date to ISO format and prepare data matching backend expectations
    const submitData = {
      ...formData,
      category_id: formData.category_id!, // We know it's required from validation
      period_start: new Date(formData.period_start).toISOString(),
    };

    try {
      if (isEditing) {
        await updateBudgetMutation.mutateAsync({
          budget_id: budget.budget_id,
          ...submitData,
        });
      } else {
        await createBudgetMutation.mutateAsync(submitData);
      }
      onClose();
    } catch (error) {
      console.error("Failed to save budget:", error);
    }
  };

  const handleInputChange = (
    field: keyof CreateBudgetData,
    value: string | number | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Budget" : "Create New Budget"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Category Selection */}
          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select
              value={formData.category_id}
              onValueChange={(value) => handleInputChange("category_id", value)}
            >
              <SelectTrigger
                className={errors.category_id ? "border-red-500" : ""}
              >
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categoriesLoading ? (
                  <SelectItem value="" disabled>
                    Loading categories...
                  </SelectItem>
                ) : (
                  categoriesResponse?.data?.map((category) => (
                    <SelectItem
                      key={category.category_id}
                      value={category.category_id}
                    >
                      <div className="flex items-center gap-2">
                        <CategoryIcon
                          iconName={category.icon}
                          className="w-4 h-4"
                        />
                        <span>{category.name}</span>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {errors.category_id && (
              <p className="text-sm text-red-500">{errors.category_id}</p>
            )}
          </div>

          {/* Budget Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Budget Name *</Label>
            <Input
              id="name"
              type="text"
              placeholder="e.g., Groceries - June"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className={errors.name ? "border-red-500" : ""}
              maxLength={100}
            />
            <div className="flex justify-between">
              {errors.name ? (
                <p className="text-sm text-red-500">{errors.name}</p>
              ) : (
                <span></span>
              )}
              <span className="text-xs text-gray-500">
                {formData.name.length}/100
              </span>
            </div>
          </div>

          {/* Amount Limit */}
          <div className="space-y-2">
            <Label htmlFor="amount_limit">Amount Limit (₹) *</Label>
            <Input
              id="amount_limit"
              type="number"
              min="0"
              step="0.01"
              placeholder="5000"
              value={formData.amount_limit || ""}
              onChange={(e) =>
                handleInputChange(
                  "amount_limit",
                  parseFloat(e.target.value) || 0
                )
              }
              className={errors.amount_limit ? "border-red-500" : ""}
            />
            {errors.amount_limit && (
              <p className="text-sm text-red-500">{errors.amount_limit}</p>
            )}
          </div>

          {/* Budget Period */}
          <div className="space-y-2">
            <Label htmlFor="budget_period">Budget Period *</Label>
            <Select
              value={formData.budget_period}
              onValueChange={(value: BudgetPeriod) =>
                handleInputChange("budget_period", value)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DAILY">Daily</SelectItem>
                <SelectItem value="WEEKLY">Weekly</SelectItem>
                <SelectItem value="MONTHLY">Monthly</SelectItem>
                <SelectItem value="QUARTERLY">Quarterly</SelectItem>
                <SelectItem value="YEARLY">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Period Start Date */}
          <div className="space-y-2">
            <Label htmlFor="period_start">Start Date *</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="period_start"
                type="date"
                value={formData.period_start}
                onChange={(e) =>
                  handleInputChange("period_start", e.target.value)
                }
                className={`pl-10 ${
                  errors.period_start ? "border-red-500" : ""
                }`}
              />
            </div>
            {errors.period_start && (
              <p className="text-sm text-red-500">{errors.period_start}</p>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditing ? "Updating..." : "Creating..."}
                </>
              ) : isEditing ? (
                "Update Budget"
              ) : (
                "Create Budget"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
