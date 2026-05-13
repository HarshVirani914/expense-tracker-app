import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import type { UpdateGroupExpenseInput } from '../schemas'
import type { ApiResponse } from '@/types/api'
import { GROUP_STATS_KEY } from '@/features/groups/hooks/use-group-stats'

const EXPENSES_KEY = ['expenses'] as const
const GROUP_BALANCES_KEY = ['group-balances'] as const
const OUTSTANDING_DEBTS_KEY = ['outstanding-debts'] as const
const DASHBOARD_KEY = ['dashboard'] as const
const GROUPS_KEY = ['groups'] as const
const EXPENSE_SUMMARY_KEY = ['expense-summary'] as const

export const useUpdateGroupExpense = (groupId?: string) => {
  const queryClient = useQueryClient()

  const { mutateAsync, isPending, error } = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateGroupExpenseInput }) => {
      const response = await apiClient.patch<ApiResponse<any>>(
        `/api/expenses/group/${id}`,
        data
      )
      return response.data
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

  const updateGroupExpense = async ({ id, data }: { id: string; data: UpdateGroupExpenseInput }) => {
    return await mutateAsync({ id, data })
  }

  return {
    updateGroupExpense,
    isUpdating: isPending,
    error,
  }
}
