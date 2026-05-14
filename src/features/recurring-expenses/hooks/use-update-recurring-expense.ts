import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { toast } from 'sonner'
import type { RecurringExpense } from '../types'
import type { UpdateRecurringExpenseInput } from '../schemas'
import type { ApiResponse } from '@/types/api'

const RECURRING_EXPENSES_KEY = ['recurring-expenses'] as const

export const useUpdateRecurringExpense = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateRecurringExpenseInput }) => {
      const response = await apiClient.patch<ApiResponse<RecurringExpense>>(
        `/api/recurring-expenses/${id}`,
        data
      )
      return response.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: RECURRING_EXPENSES_KEY })
      queryClient.invalidateQueries({ queryKey: [...RECURRING_EXPENSES_KEY, variables.id] })
      toast.success('Recurring expense updated successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update recurring expense')
    },
  })
}
