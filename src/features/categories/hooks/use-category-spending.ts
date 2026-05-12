import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { ApiResponse } from "@/types/api";
import type { CategorySpending } from "../types";

const CATEGORY_SPENDING_KEY = ["category-spending"] as const;

type CategorySpendingFilters = {
  startDate?: Date;
  endDate?: Date;
};

export const useCategorySpending = (filters?: CategorySpendingFilters) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [...CATEGORY_SPENDING_KEY, filters] as const,
    queryFn: async () => {
      const params: Record<string, string> = {};
      
      if (filters?.startDate) {
        params.startDate = filters.startDate.toISOString();
      }
      if (filters?.endDate) {
        params.endDate = filters.endDate.toISOString();
      }

      const response = await apiClient.get<ApiResponse<CategorySpending[]>>(
        "/api/categories/spending",
        params
      );
      return response.data;
    },
    staleTime: 30000,
  });

  return {
    categorySpending: data,
    isLoading,
    error,
    refetch,
  };
};
