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
import { Loader2, Calendar, MapPin } from "lucide-react";
import { useCategories } from "@/services/category";
import { useCreateExpense, useUpdateExpense } from "@/services/expense";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import type { Expense, PaymentMethod, CreateExpenseData } from "@/types";

interface ExpenseFormProps {
  isOpen: boolean;
  onClose: () => void;
  expense?: Expense; // If provided, we're editing
}

export function ExpenseForm({ isOpen, onClose, expense }: ExpenseFormProps) {
  const [formData, setFormData] = useState<CreateExpenseData>({
    category_id: "",
    amount: 0,
    currency: "INR",
    description: "",
    merchant_name: "",
    expense_date: "",
    payment_method: "CASH",
    location: {
      latitude: 0,
      longitude: 0,
      address: "",
    },
    notes: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: categoriesResponse, isLoading: categoriesLoading } =
    useCategories();
  const createExpenseMutation = useCreateExpense();
  const updateExpenseMutation = useUpdateExpense();

  const isEditing = !!expense;
  const isLoading =
    createExpenseMutation.isPending || updateExpenseMutation.isPending;

  useEffect(() => {
    if (expense) {
      setFormData({
        category_id: expense.category_id,
        amount: parseFloat(expense.amount),
        currency: expense.currency,
        description: expense.description,
        merchant_name: expense.merchant_name,
        expense_date: new Date(expense.expense_date).toISOString().slice(0, 16), // For datetime-local input
        payment_method: expense.payment_method,
        location: expense.location,
        notes: expense.notes || "",
      });
    } else {
      // Reset form for new expense
      const now = new Date();
      setFormData({
        category_id: "",
        amount: 0,
        currency: "INR",
        description: "",
        merchant_name: "",
        expense_date: now.toISOString().slice(0, 16),
        payment_method: "CASH",
        location: {
          latitude: 0,
          longitude: 0,
          address: "",
        },
        notes: "",
      });
    }
    setErrors({});
  }, [expense, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.category_id) {
      newErrors.category_id = "Category is required";
    }
    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }
    if (!formData.merchant_name.trim()) {
      newErrors.merchant_name = "Merchant name is required";
    }
    if (formData.amount <= 0) {
      newErrors.amount = "Amount must be greater than 0";
    }
    if (!formData.expense_date) {
      newErrors.expense_date = "Expense date is required";
    }
    if (!formData.location.address.trim()) {
      newErrors.address = "Address is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    // Convert datetime-local to ISO string and prepare data
    const submitData = {
      ...formData,
      expense_date: new Date(formData.expense_date).toISOString(),
    };

    try {
      if (isEditing) {
        await updateExpenseMutation.mutateAsync({
          expense_id: expense.expense_id,
          ...submitData,
        });
      } else {
        await createExpenseMutation.mutateAsync(submitData);
      }
      onClose();
    } catch (error) {
      console.error("Failed to save expense:", error);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    if (field.startsWith("location.")) {
      const locationField = field.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        location: { ...prev.location, [locationField]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Expense" : "Add New Expense"}
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

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Input
              id="description"
              type="text"
              placeholder="e.g., Lunch at McDonald's"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              className={errors.description ? "border-red-500" : ""}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description}</p>
            )}
          </div>

          {/* Amount and Currency */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount *</Label>
              <Input
                id="amount"
                type="number"
                min="0"
                step="0.01"
                placeholder="450.50"
                value={formData.amount || ""}
                onChange={(e) =>
                  handleInputChange("amount", parseFloat(e.target.value) || 0)
                }
                className={errors.amount ? "border-red-500" : ""}
              />
              {errors.amount && (
                <p className="text-sm text-red-500">{errors.amount}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select
                value={formData.currency}
                onValueChange={(value) => handleInputChange("currency", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INR">INR (₹)</SelectItem>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Merchant Name */}
          <div className="space-y-2">
            <Label htmlFor="merchant_name">Merchant Name *</Label>
            <Input
              id="merchant_name"
              type="text"
              placeholder="McDonald's"
              value={formData.merchant_name}
              onChange={(e) =>
                handleInputChange("merchant_name", e.target.value)
              }
              className={errors.merchant_name ? "border-red-500" : ""}
            />
            {errors.merchant_name && (
              <p className="text-sm text-red-500">{errors.merchant_name}</p>
            )}
          </div>

          {/* Payment Method */}
          <div className="space-y-2">
            <Label htmlFor="payment_method">Payment Method *</Label>
            <Select
              value={formData.payment_method}
              onValueChange={(value: PaymentMethod) =>
                handleInputChange("payment_method", value)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CASH">Cash</SelectItem>
                <SelectItem value="CREDIT_CARD">Credit Card</SelectItem>
                <SelectItem value="DEBIT_CARD">Debit Card</SelectItem>
                <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                <SelectItem value="UPI">UPI</SelectItem>
                <SelectItem value="CHEQUE">Cheque</SelectItem>
                <SelectItem value="WALLET">Wallet</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Expense Date */}
          <div className="space-y-2">
            <Label htmlFor="expense_date">Expense Date & Time *</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="expense_date"
                type="datetime-local"
                value={formData.expense_date}
                onChange={(e) =>
                  handleInputChange("expense_date", e.target.value)
                }
                className={`pl-10 ${
                  errors.expense_date ? "border-red-500" : ""
                }`}
              />
            </div>
            {errors.expense_date && (
              <p className="text-sm text-red-500">{errors.expense_date}</p>
            )}
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="address">Location *</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="address"
                type="text"
                placeholder="Pune, Maharashtra, India"
                value={formData.location.address}
                onChange={(e) =>
                  handleInputChange("location.address", e.target.value)
                }
                className={`pl-10 ${errors.address ? "border-red-500" : ""}`}
              />
            </div>
            {errors.address && (
              <p className="text-sm text-red-500">{errors.address}</p>
            )}
          </div>

          {/* Optional: Coordinates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="latitude">Latitude (Optional)</Label>
              <Input
                id="latitude"
                type="number"
                step="any"
                placeholder="18.5204"
                value={formData.location.latitude || ""}
                onChange={(e) =>
                  handleInputChange(
                    "location.latitude",
                    parseFloat(e.target.value) || 0
                  )
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="longitude">Longitude (Optional)</Label>
              <Input
                id="longitude"
                type="number"
                step="any"
                placeholder="73.8567"
                value={formData.location.longitude || ""}
                onChange={(e) =>
                  handleInputChange(
                    "location.longitude",
                    parseFloat(e.target.value) || 0
                  )
                }
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Input
              id="notes"
              type="text"
              placeholder="Team lunch"
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
            />
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditing ? "Updating..." : "Adding..."}
                </>
              ) : isEditing ? (
                "Update Expense"
              ) : (
                "Add Expense"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
