import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { toast } from 'sonner'
import type { Budget } from '../types'
import type { CreateBudgetInput } from '../schemas'
import type { ApiResponse } from '@/types/api'

export const useCreateBudget = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateBudgetInput) => {
      const response = await apiClient.post<ApiResponse<Budget>>('/api/budgets', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] })
      toast.success('Budget created successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create budget')
    },
  })
}
