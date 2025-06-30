import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "./api";
import type {
  ApiResponse,
  Expense,
  CreateExpenseData,
  UpdateExpenseData,
} from "@/types";

// Expense API functions
export const getExpenses = async (): Promise<ApiResponse<Expense[]>> => {
  return apiClient.get<ApiResponse<Expense[]>>("/expense");
};

export const getExpense = async (
  expenseId: string
): Promise<ApiResponse<Expense>> => {
  return apiClient.get<ApiResponse<Expense>>(`/expense/${expenseId}`);
};

export const createExpense = async (
  data: CreateExpenseData
): Promise<ApiResponse<Expense>> => {
  return apiClient.post<ApiResponse<Expense>>("/expense", data);
};

export const updateExpense = async ({
  expense_id,
  ...data
}: UpdateExpenseData): Promise<ApiResponse<Expense>> => {
  return apiClient.patch<ApiResponse<Expense>>(`/expense/${expense_id}`, data);
};

export const deleteExpense = async (
  expenseId: string
): Promise<ApiResponse<void>> => {
  return apiClient.delete<ApiResponse<void>>(`/expense/${expenseId}`);
};

// TanStack Query hooks
export const useExpenses = () => {
  return useQuery({
    queryKey: ["expenses"],
    queryFn: getExpenses,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useExpense = (expenseId: string) => {
  return useQuery({
    queryKey: ["expense", expenseId],
    queryFn: () => getExpense(expenseId),
    enabled: !!expenseId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["budgets"] }); // Invalidate budgets as spending affects them
    },
  });
};

export const useUpdateExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateExpense,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({
        queryKey: ["expense", variables.expense_id],
      });
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
    },
  });
};

export const useDeleteExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
    },
  });
};
