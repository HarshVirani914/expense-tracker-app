import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import type { BudgetWithSpending } from '../types'
import type { ApiResponse } from '@/types/api'

const BUDGETS_KEY = ['budgets'] as const

export const useBudgets = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: BUDGETS_KEY,
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<BudgetWithSpending[]>>('/api/budgets')
      return response.data
    },
  })

  return {
    budgets: data,
    isLoading,
    error,
    refetch,
  }
}
