import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { toast } from 'sonner'
import type { RecurringExpense } from '../types'
import type { ApiResponse } from '@/types/api'

const RECURRING_EXPENSES_KEY = ['recurring-expenses'] as const

export const useToggleRecurringExpense = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.post<ApiResponse<RecurringExpense>>(
        `/api/recurring-expenses/${id}/toggle`,
        {}
      )
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RECURRING_EXPENSES_KEY })
      toast.success('Recurring expense status updated')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to toggle recurring expense')
    },
  })
}
