import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import type { SpendingTrend, AnalyticsFilters } from '../types'
import type { ApiResponse } from '@/types/api'

const SPENDING_TRENDS_KEY = ['analytics', 'trends'] as const

export const useSpendingTrends = (filters?: AnalyticsFilters) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [...SPENDING_TRENDS_KEY, filters] as const,
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<SpendingTrend[]>>(
        '/api/analytics/trends',
        filters as Record<string, string | undefined>
      )
      return response.data
    },
  })

  return {
    trends: data,
    isLoading,
    error,
    refetch,
  }
}
