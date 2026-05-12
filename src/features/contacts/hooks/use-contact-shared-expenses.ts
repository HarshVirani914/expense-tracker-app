import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { ApiResponse } from "@/types/api";
import type { ContactSharedExpense } from "../types";

export const useContactSharedExpenses = (contactId: string, limit: number = 10) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["contact-shared-expenses", contactId, limit] as const,
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<ContactSharedExpense[]>>(
        `/api/contacts/${contactId}/shared-expenses`,
        { limit }
      );
      return response.data;
    },
    enabled: !!contactId,
  });

  return {
    sharedExpenses: data,
    isLoading,
    error,
    refetch,
  };
};
