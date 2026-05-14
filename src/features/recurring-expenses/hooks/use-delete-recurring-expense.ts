import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { toast } from 'sonner'
import type { ApiResponse } from '@/types/api'

const RECURRING_EXPENSES_KEY = ['recurring-expenses'] as const

export const useDeleteRecurringExpense = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete<ApiResponse<null>>(
        `/api/recurring-expenses/${id}`
      )
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RECURRING_EXPENSES_KEY })
      toast.success('Recurring expense deleted successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete recurring expense')
    },
  })
}
