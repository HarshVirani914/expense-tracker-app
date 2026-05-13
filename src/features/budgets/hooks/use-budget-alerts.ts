import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import type { BudgetAlert } from '../types'
import type { ApiResponse } from '@/types/api'

const BUDGET_ALERTS_KEY = ['budgets', 'alerts'] as const

export const useBudgetAlerts = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: BUDGET_ALERTS_KEY,
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<BudgetAlert[]>>('/api/budgets/alerts')
      return response.data
    },
  })

  return {
    alerts: data,
    isLoading,
    error,
    refetch,
  }
}
