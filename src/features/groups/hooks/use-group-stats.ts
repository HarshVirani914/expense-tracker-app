import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { ApiResponse } from "@/types/api";
import type { GroupStats } from "../types";

export const GROUP_STATS_KEY = ["group-stats"] as const;

export const useGroupStats = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: GROUP_STATS_KEY,
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<GroupStats>>(
        "/api/groups/stats"
      );
      return response.data;
    },
  });

  return {
    stats: data,
    isLoading,
    error,
    refetch,
  };
};
