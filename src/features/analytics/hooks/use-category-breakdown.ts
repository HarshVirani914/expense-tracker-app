import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import type { CategoryBreakdown, AnalyticsFilters } from '../types'
import type { ApiResponse } from '@/types/api'

const CATEGORY_BREAKDOWN_KEY = ['analytics', 'categories'] as const

export const useCategoryBreakdown = (filters?: AnalyticsFilters) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [...CATEGORY_BREAKDOWN_KEY, filters] as const,
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<CategoryBreakdown[]>>(
        '/api/analytics/categories',
        filters as Record<string, string | undefined>
      )
      return response.data
    },
  })

  return {
    breakdown: data,
    isLoading,
    error,
    refetch,
  }
}
