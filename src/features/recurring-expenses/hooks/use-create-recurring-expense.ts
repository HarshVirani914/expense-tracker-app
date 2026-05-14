import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { toast } from 'sonner'
import type { RecurringExpense } from '../types'
import type { CreateRecurringExpenseInput } from '../schemas'
import type { ApiResponse } from '@/types/api'

const RECURRING_EXPENSES_KEY = ['recurring-expenses'] as const

export const useCreateRecurringExpense = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateRecurringExpenseInput) => {
      const response = await apiClient.post<ApiResponse<RecurringExpense>>(
        '/api/recurring-expenses',
        data
      )
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RECURRING_EXPENSES_KEY })
      toast.success('Recurring expense created successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create recurring expense')
    },
  })
}
