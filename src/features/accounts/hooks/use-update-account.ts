import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import type { AccountWithBalance, UpdateAccountInput } from '../types'
import type { ApiResponse } from '@/types/api'

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
    },
  })

  const updateAccount = async ({ id, data }: { id: string; data: UpdateAccountInput }) => {
    try {
      return await mutateAsync({ id, data })
    } catch (error) {
      throw new Error('Failed to update account')
    }
  }

  return {
    updateAccount,
    isUpdating: isPending,
    error,
  }
}
