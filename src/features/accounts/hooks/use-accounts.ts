import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import type { AccountWithBalance } from '../types'
import type { ApiResponse } from '@/types/api'

const ACCOUNTS_KEY = ['accounts'] as const

export const useAccounts = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ACCOUNTS_KEY,
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<AccountWithBalance[]>>(
        '/api/accounts'
      )
      return response.data
    },
  })

  return {
    accounts: data,
    isLoading,
    error,
    refetch,
  }
}
