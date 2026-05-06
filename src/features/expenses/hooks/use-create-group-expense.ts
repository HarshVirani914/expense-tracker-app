import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import type { CreateGroupExpenseInput } from '../schemas'
import type { ApiResponse } from '@/types/api'

const EXPENSES_KEY = ['expenses'] as const
const GROUP_BALANCES_KEY = ['group-balances'] as const

export const useCreateGroupExpense = (groupId?: string) => {
  const queryClient = useQueryClient()

  const { mutateAsync, isPending, error } = useMutation({
    mutationFn: async (data: CreateGroupExpenseInput) => {
      const response = await apiClient.post<ApiResponse<any>>(
        '/api/expenses/group',
        data
      )
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EXPENSES_KEY })
      if (groupId) {
        queryClient.invalidateQueries({ 
          queryKey: [...GROUP_BALANCES_KEY, groupId] 
        })
      }
    },
  })

  const createGroupExpense = async (data: CreateGroupExpenseInput) => {
    return await mutateAsync(data)
  }

  return {
    createGroupExpense,
    isCreating: isPending,
    error,
  }
}
