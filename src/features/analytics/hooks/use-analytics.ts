import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import type { AnalyticsData, AnalyticsFilters } from '../types'
import type { ApiResponse } from '@/types/api'

const ANALYTICS_KEY = ['analytics'] as const

export const useAnalytics = (filters?: AnalyticsFilters) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [...ANALYTICS_KEY, filters] as const,
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<AnalyticsData>>(
        '/api/analytics',
        filters as Record<string, string | undefined>
      )
      return response.data
    },
  })

  return {
    analytics: data,
    isLoading,
    error,
    refetch,
  }
}
