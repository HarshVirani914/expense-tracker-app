import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { ApiResponse } from "@/types/api";
import type { ContactStats } from "../types";

const CONTACT_STATS_KEY = ["contact-stats"] as const;

export const useContactStats = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: CONTACT_STATS_KEY,
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<ContactStats>>(
        "/api/contacts/stats"
      );
      return response.data;
    },
    staleTime: 30000,
  });

  return {
    stats: data,
    isLoading,
    error,
    refetch,
  };
};
