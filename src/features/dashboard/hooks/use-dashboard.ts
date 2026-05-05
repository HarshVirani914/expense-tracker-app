import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import type { DashboardStats } from '../types'
import type { ApiResponse } from '@/types/api'

export const DASHBOARD_KEY = ['dashboard', 'stats'] as const

export const useDashboardStats = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: DASHBOARD_KEY,
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<DashboardStats>>(
        '/api/dashboard/stats'
      )
      return response.data
    },
    staleTime: 2 * 60 * 1000,
  })

  return {
    stats: data,
    isLoading,
    error,
    refetch,
  }
}
