import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { toast } from 'sonner'
import type { Budget } from '../types'
import type { UpdateBudgetInput } from '../schemas'
import type { ApiResponse } from '@/types/api'

export const useUpdateBudget = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateBudgetInput }) => {
      const response = await apiClient.patch<ApiResponse<Budget>>(`/api/budgets/${id}`, data)
      return response.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] })
      queryClient.invalidateQueries({ queryKey: ['budget', variables.id] })
      toast.success('Budget updated successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update budget')
    },
  })
}
