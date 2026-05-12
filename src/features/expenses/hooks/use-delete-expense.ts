import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'

const EXPENSES_KEY = ['expenses'] as const
const EXPENSE_SUMMARY_KEY = ['expense-summary'] as const
const ACCOUNTS_KEY = ['accounts'] as const
const DASHBOARD_KEY = ['dashboard'] as const
const OUTSTANDING_DEBTS_KEY = ['outstanding-debts'] as const
const GROUP_BALANCES_KEY = ['group-balances'] as const
const GROUPS_KEY = ['groups'] as const

export const useDeleteExpense = () => {
  const queryClient = useQueryClient()

  const { mutateAsync, isPending, error } = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/api/expenses/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EXPENSES_KEY })
      queryClient.invalidateQueries({ queryKey: EXPENSE_SUMMARY_KEY })
      queryClient.invalidateQueries({ queryKey: ACCOUNTS_KEY })
      queryClient.invalidateQueries({ queryKey: DASHBOARD_KEY })
      queryClient.invalidateQueries({ queryKey: OUTSTANDING_DEBTS_KEY })
      queryClient.invalidateQueries({ queryKey: GROUP_BALANCES_KEY })
      queryClient.invalidateQueries({ queryKey: GROUPS_KEY })
    },
  })

  const deleteExpense = async (id: string) => {
    try {
      return await mutateAsync(id)
    } catch (error) {
      throw new Error('Failed to delete expense')
    }
  }

  return {
    deleteExpense,
    isDeleting: isPending,
    error,
  }
}
