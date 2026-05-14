import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import type { ApiResponse } from '@/types/api'

type ProcessResult = {
  processed: number
  errors: number
}

const EXPENSES_KEY = ['expenses'] as const
const EXPENSE_SUMMARY_KEY = ['expense-summary'] as const
const DASHBOARD_KEY = ['dashboard'] as const
const RECURRING_EXPENSES_KEY = ['recurring-expenses'] as const

export const useProcessRecurringExpenses = () => {
  const queryClient = useQueryClient()

  const { mutateAsync, isPending, error } = useMutation({
    mutationFn: async () => {
      const response = await apiClient.post<ApiResponse<ProcessResult>>(
        '/api/recurring-expenses/process'
      )
      return response.data
    },
    onSuccess: () => {
      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: EXPENSES_KEY })
      queryClient.invalidateQueries({ queryKey: EXPENSE_SUMMARY_KEY })
      queryClient.invalidateQueries({ queryKey: DASHBOARD_KEY })
      queryClient.invalidateQueries({ queryKey: RECURRING_EXPENSES_KEY })
    },
  })

  const processRecurringExpenses = async () => {
    return await mutateAsync()
  }

  return {
    processRecurringExpenses,
    isProcessing: isPending,
    error,
  }
}
