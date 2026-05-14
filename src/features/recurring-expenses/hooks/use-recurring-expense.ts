import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import type { RecurringExpenseWithRelations } from '../types'
import type { ApiResponse } from '@/types/api'

const RECURRING_EXPENSES_KEY = ['recurring-expenses'] as const

export const useRecurringExpense = (id: string) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [...RECURRING_EXPENSES_KEY, id] as const,
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<RecurringExpenseWithRelations>>(
        `/api/recurring-expenses/${id}`
      )
      return response.data
    },
    enabled: !!id,
  })

  return {
    recurringExpense: data,
    isLoading,
    error,
    refetch,
  }
}
