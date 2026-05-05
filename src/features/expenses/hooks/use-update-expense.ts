import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import type { ExpenseWithRelations, UpdateExpenseInput } from '../types'
import type { ApiResponse } from '@/types/api'

const EXPENSES_KEY = ['expenses'] as const
const ACCOUNTS_KEY = ['accounts'] as const
const DASHBOARD_KEY = ['dashboard'] as const

export const useUpdateExpense = () => {
  const queryClient = useQueryClient()

  const { mutateAsync, isPending, error } = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateExpenseInput }) => {
      const response = await apiClient.patch<ApiResponse<ExpenseWithRelations>>(
        `/api/expenses/${id}`,
        data
      )
      return response.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: EXPENSES_KEY })
      queryClient.invalidateQueries({ queryKey: [...EXPENSES_KEY, variables.id] })
      queryClient.invalidateQueries({ queryKey: ACCOUNTS_KEY })
      queryClient.invalidateQueries({ queryKey: DASHBOARD_KEY })
    },
  })

  const updateExpense = async ({ id, data }: { id: string; data: UpdateExpenseInput }) => {
    return await mutateAsync({ id, data })
  }

  return {
    updateExpense,
    isUpdating: isPending,
    error,
  }
}
