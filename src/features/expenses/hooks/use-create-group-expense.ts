import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import type { CreateGroupExpenseInput } from '../schemas'
import type { ApiResponse } from '@/types/api'
import { GROUP_STATS_KEY } from '@/features/groups/hooks/use-group-stats'

const EXPENSES_KEY = ['expenses'] as const
const GROUP_BALANCES_KEY = ['group-balances'] as const
const OUTSTANDING_DEBTS_KEY = ['outstanding-debts'] as const
const DASHBOARD_KEY = ['dashboard'] as const
const GROUPS_KEY = ['groups'] as const

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
      queryClient.invalidateQueries({ queryKey: OUTSTANDING_DEBTS_KEY })
      queryClient.invalidateQueries({ queryKey: DASHBOARD_KEY })
      queryClient.invalidateQueries({ queryKey: GROUPS_KEY })
      queryClient.invalidateQueries({ queryKey: GROUP_STATS_KEY })
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
