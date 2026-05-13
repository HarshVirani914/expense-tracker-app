import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import type { ApiResponse } from '@/types/api'
import { GROUP_STATS_KEY } from '@/features/groups/hooks/use-group-stats'

const EXPENSES_KEY = ['expenses'] as const
const GROUP_BALANCES_KEY = ['group-balances'] as const
const OUTSTANDING_DEBTS_KEY = ['outstanding-debts'] as const
const DASHBOARD_KEY = ['dashboard'] as const
const GROUPS_KEY = ['groups'] as const
const EXPENSE_SUMMARY_KEY = ['expense-summary'] as const

export const useDeleteGroupExpense = (groupId?: string) => {
  const queryClient = useQueryClient()

  const { mutateAsync, isPending, error } = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete<ApiResponse<undefined>>(`/api/expenses/group/${id}`)
      return response
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EXPENSES_KEY })
      queryClient.invalidateQueries({ queryKey: EXPENSE_SUMMARY_KEY })
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

  const deleteGroupExpense = async (id: string) => {
    try {
      return await mutateAsync(id)
    } catch (error) {
      throw new Error('Failed to delete group expense')
    }
  }

  return {
    deleteGroupExpense,
    isDeleting: isPending,
    error,
  }
}
