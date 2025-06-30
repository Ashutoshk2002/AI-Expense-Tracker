import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Loader2, AlertCircle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { BudgetCard } from "./BudgetCard";
import { BudgetForm } from "./BudgetForm";
import { useBudgets, useDeleteBudget } from "@/services/budget";
import type { Budget } from "@/types";

export function BudgetsList() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | undefined>();
  const [deletingBudgetId, setDeletingBudgetId] = useState<string | null>(null);

  const { data: budgetsResponse, isLoading, error } = useBudgets();
  const deleteBudgetMutation = useDeleteBudget();

  const budgets = budgetsResponse?.data || [];

  const handleCreateBudget = () => {
    setEditingBudget(undefined);
    setIsFormOpen(true);
  };

  const handleEditBudget = (budget: Budget) => {
    setEditingBudget(budget);
    setIsFormOpen(true);
  };

  const handleDeleteBudget = (budgetId: string) => {
    setDeletingBudgetId(budgetId);
  };

  const confirmDelete = async () => {
    if (!deletingBudgetId) return;

    try {
      await deleteBudgetMutation.mutateAsync(deletingBudgetId);
      setDeletingBudgetId(null);
    } catch (error) {
      console.error("Failed to delete budget:", error);
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingBudget(undefined);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        <span className="ml-2 text-gray-500">Loading budgets...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <AlertCircle className="h-8 w-8 text-red-500" />
        <span className="ml-2 text-red-500">Failed to load budgets</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Budgets</h2>
          <p className="text-gray-600">
            Manage your budget limits and track spending progress
          </p>
        </div>
        <Button onClick={handleCreateBudget}>
          <Plus className="w-4 h-4 mr-2" />
          Create Budget
        </Button>
      </div>

      {/* Budgets Grid */}
      {budgets.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No budgets yet
          </h3>
          <p className="text-gray-600 mb-4">
            Create your first budget to start tracking your spending
          </p>
          <Button onClick={handleCreateBudget}>
            <Plus className="w-4 h-4 mr-2" />
            Create Your First Budget
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {budgets.map((budget) => (
            <BudgetCard
              key={budget.budget_id}
              budget={budget}
              onEdit={handleEditBudget}
              onDelete={handleDeleteBudget}
            />
          ))}
        </div>
      )}

      {/* Budget Form Dialog */}
      <BudgetForm
        isOpen={isFormOpen}
        onClose={handleFormClose}
        budget={editingBudget}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deletingBudgetId}
        onOpenChange={() => setDeletingBudgetId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Budget</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this budget? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteBudgetMutation.isPending}
            >
              {deleteBudgetMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
