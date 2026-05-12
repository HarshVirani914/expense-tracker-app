import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import type { ExpenseWithRelations, CreateExpenseInput } from '../types'
import type { ApiResponse } from '@/types/api'

const EXPENSES_KEY = ['expenses'] as const
const EXPENSE_SUMMARY_KEY = ['expense-summary'] as const
const ACCOUNTS_KEY = ['accounts'] as const
const DASHBOARD_KEY = ['dashboard'] as const
const OUTSTANDING_DEBTS_KEY = ['outstanding-debts'] as const
const GROUP_BALANCES_KEY = ['group-balances'] as const
const GROUPS_KEY = ['groups'] as const

export const useCreateExpense = () => {
  const queryClient = useQueryClient()

  const { mutateAsync, isPending, error } = useMutation({
    mutationFn: async (data: CreateExpenseInput) => {
      const response = await apiClient.post<ApiResponse<ExpenseWithRelations>>(
        '/api/expenses',
        data
      )
      return response.data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: EXPENSES_KEY })
      queryClient.invalidateQueries({ queryKey: EXPENSE_SUMMARY_KEY })
      queryClient.invalidateQueries({ queryKey: ACCOUNTS_KEY })
      queryClient.invalidateQueries({ queryKey: DASHBOARD_KEY })
      queryClient.invalidateQueries({ queryKey: OUTSTANDING_DEBTS_KEY })
      queryClient.invalidateQueries({ queryKey: GROUPS_KEY })
      if (data.groupId) {
        queryClient.invalidateQueries({
          queryKey: [...GROUP_BALANCES_KEY, data.groupId]
        })
      }
    },
  })

  const createExpense = async (data: CreateExpenseInput) => {
    return await mutateAsync(data)
  }

  return {
    createExpense,
    isCreating: isPending,
    error,
  }
}
