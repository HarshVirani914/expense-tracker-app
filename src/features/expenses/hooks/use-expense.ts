import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import type { ExpenseWithRelations } from '../types'
import type { ApiResponse } from '@/types/api'

const EXPENSES_KEY = ['expenses'] as const

export const useExpense = (id: string | undefined) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [...EXPENSES_KEY, id] as const,
    queryFn: async () => {
      if (!id) throw new Error('Expense ID is required')
      const response = await apiClient.get<ApiResponse<ExpenseWithRelations>>(
        `/api/expenses/${id}`
      )
      return response.data
    },
    enabled: !!id,
  })

  return {
    expense: data,
    isLoading,
    error,
    refetch,
  }
}
