import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import type { UpcomingRecurrence } from '../types'
import type { ApiResponse } from '@/types/api'

const RECURRING_EXPENSES_KEY = ['recurring-expenses'] as const

export const useUpcomingRecurringExpenses = (days = 7) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [...RECURRING_EXPENSES_KEY, 'upcoming', days] as const,
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<UpcomingRecurrence[]>>(
        '/api/recurring-expenses/upcoming',
        { days }
      )
      return response.data
    },
  })

  return {
    upcoming: data,
    isLoading,
    error,
    refetch,
  }
}
