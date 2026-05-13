import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import type { BudgetWithSpending } from '../types'
import type { ApiResponse } from '@/types/api'

const BUDGET_KEY = ['budget'] as const

export const useBudget = (id: string) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [...BUDGET_KEY, id] as const,
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<BudgetWithSpending>>(
        `/api/budgets/${id}`
      )
      return response.data
    },
    enabled: !!id,
  })

  return {
    budget: data,
    isLoading,
    error,
    refetch,
  }
}
