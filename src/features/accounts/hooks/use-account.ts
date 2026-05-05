import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import type { AccountWithBalance } from '../types'
import type { ApiResponse } from '@/types/api'

const ACCOUNTS_KEY = ['accounts'] as const

export const useAccount = (id: string | undefined) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [...ACCOUNTS_KEY, id] as const,
    queryFn: async () => {
      if (!id) throw new Error('Account ID is required')
      const response = await apiClient.get<ApiResponse<AccountWithBalance>>(
        `/api/accounts/${id}`
      )
      return response.data
    },
    enabled: !!id,
  })

  return {
    account: data,
    isLoading,
    error,
    refetch,
  }
}
