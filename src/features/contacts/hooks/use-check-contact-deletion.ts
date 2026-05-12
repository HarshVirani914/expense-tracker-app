import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { ApiResponse } from "@/types/api";
import type { ContactDeletionCheck } from "../types";

export const useCheckContactDeletion = (contactId: string) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["contact-deletion-check", contactId] as const,
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<ContactDeletionCheck>>(
        `/api/contacts/${contactId}/check-deletion`
      );
      return response.data;
    },
    enabled: !!contactId,
  });

  return {
    deletionCheck: data,
    isLoading,
    error,
    refetch,
  };
};
