import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import type { AccountWithBalance, UpdateAccountInput } from '../types'
import type { ApiResponse } from '@/types/api'
import { DASHBOARD_KEY } from '@/features/dashboard/hooks/use-dashboard'

const ACCOUNTS_KEY = ['accounts'] as const

export const useUpdateAccount = () => {
  const queryClient = useQueryClient()

  const { mutateAsync, isPending, error } = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateAccountInput }) => {
      const response = await apiClient.patch<ApiResponse<AccountWithBalance>>(
        `/api/accounts/${id}`,
        data
      )
      return response.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ACCOUNTS_KEY })
      queryClient.invalidateQueries({ queryKey: [...ACCOUNTS_KEY, variables.id] })
      queryClient.invalidateQueries({ queryKey: DASHBOARD_KEY })
    },
  })

  const updateAccount = async ({ id, data }: { id: string; data: UpdateAccountInput }) => {
    return await mutateAsync({ id, data })
  }

  return {
    updateAccount,
    isUpdating: isPending,
    error,
  }
}
