import { useQuery } from "@tanstack/react-query";
import { apiClient } from "./api";
import type { ApiResponse, Category } from "@/types";

// Category API functions
export const getCategories = async (): Promise<ApiResponse<Category[]>> => {
  return apiClient.get<ApiResponse<Category[]>>("/categories");
};

// TanStack Query hooks
export const useCategories = () => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
    staleTime: 30 * 60 * 1000, // 30 minutes - categories don't change often
  });
};
