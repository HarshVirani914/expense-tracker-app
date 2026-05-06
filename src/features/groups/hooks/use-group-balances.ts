import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import type { GroupBalance } from '../types'
import type { ApiResponse } from '@/types/api'

const GROUP_BALANCES_KEY = ['group-balances'] as const

export const useGroupBalances = (groupId?: string) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [...GROUP_BALANCES_KEY, groupId] as const,
    queryFn: async () => {
      if (!groupId) throw new Error('Group ID is required')
      const response = await apiClient.get<ApiResponse<GroupBalance[]>>(
        `/api/groups/${groupId}/balances`
      )
      return response.data
    },
    enabled: !!groupId,
  })

  return {
    balances: data,
    isLoading,
    error,
    refetch,
  }
}
