import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import type { ExpenseWithRelations, ExpenseFilters } from '../types'
import type { PaginatedResponse } from '@/types/api'

const EXPENSES_KEY = ['expenses'] as const

export const useExpenses = (filters?: ExpenseFilters) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [...EXPENSES_KEY, filters] as const,
    queryFn: async () => {
      const response = await apiClient.get<PaginatedResponse<ExpenseWithRelations>>(
        '/api/expenses',
        filters as Record<string, string | number | boolean | undefined>
      )
      return response
    },
  })

  return {
    expenses: data?.data,
    pagination: data?.pagination,
    isLoading,
    error,
    refetch,
  }
}
