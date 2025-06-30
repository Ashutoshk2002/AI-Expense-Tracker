import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "./api";
import type {
  ApiResponse,
  Budget,
  CreateBudgetData,
  UpdateBudgetData,
} from "@/types";

// Budget API functions
export const getBudgets = async (): Promise<ApiResponse<Budget[]>> => {
  return apiClient.get<ApiResponse<Budget[]>>("/budget");
};

export const getBudget = async (
  budgetId: string
): Promise<ApiResponse<Budget>> => {
  return apiClient.get<ApiResponse<Budget>>(`/budget/${budgetId}`);
};

export const createBudget = async (
  data: CreateBudgetData
): Promise<ApiResponse<Budget>> => {
  return apiClient.post<ApiResponse<Budget>>("/budget", data);
};

export const updateBudget = async ({
  budget_id,
  ...data
}: UpdateBudgetData): Promise<ApiResponse<Budget>> => {
  return apiClient.patch<ApiResponse<Budget>>(`/budget/${budget_id}`, data);
};

export const deleteBudget = async (
  budgetId: string
): Promise<ApiResponse<void>> => {
  return apiClient.delete<ApiResponse<void>>(`/budget/${budgetId}`);
};

// TanStack Query hooks
export const useBudgets = () => {
  return useQuery({
    queryKey: ["budgets"],
    queryFn: getBudgets,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useBudget = (budgetId: string) => {
  return useQuery({
    queryKey: ["budget", budgetId],
    queryFn: () => getBudget(budgetId),
    enabled: !!budgetId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateBudget = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createBudget,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
    },
  });
};

export const useUpdateBudget = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateBudget,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      queryClient.invalidateQueries({
        queryKey: ["budget", variables.budget_id],
      });
    },
  });
};

export const useDeleteBudget = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteBudget,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
    },
  });
};
