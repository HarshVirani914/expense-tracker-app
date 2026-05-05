import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import type { AccountWithBalance, CreateAccountInput } from '../types'
import type { ApiResponse } from '@/types/api'

const ACCOUNTS_KEY = ['accounts'] as const

export const useCreateAccount = () => {
  const queryClient = useQueryClient()

  const { mutateAsync, isPending, error } = useMutation({
    mutationFn: async (data: CreateAccountInput) => {
      const response = await apiClient.post<ApiResponse<AccountWithBalance>>(
        '/api/accounts',
        data
      )
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ACCOUNTS_KEY })
    },
  })

  const createAccount = async (data: CreateAccountInput) => {
    try {
      return await mutateAsync(data)
    } catch (error) {
      throw new Error('Failed to create account')
    }
  }

  return {
    createAccount,
    isCreating: isPending,
    error,
  }
}
