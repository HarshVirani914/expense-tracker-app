import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { ApiResponse } from "@/types/api";
import type { ExpenseFilters, ExpenseSummary } from "../types";

const EXPENSE_SUMMARY_KEY = ["expense-summary"] as const;

export const useExpenseSummary = (filters?: ExpenseFilters) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [...EXPENSE_SUMMARY_KEY, filters] as const,
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<ExpenseSummary>>(
        "/api/expenses/summary",
        filters as Record<string, string | number | boolean | Date | undefined>
      );
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  return {
    summary: data,
    isLoading,
    error,
    refetch,
  };
};
