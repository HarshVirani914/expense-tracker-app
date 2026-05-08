import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import type { GroupWithMembers } from '../types'
import type { ApiResponse } from '@/types/api'

const GROUP_KEY = ['group'] as const

export const useGroup = (
  groupId?: string,
  options?: { enabled?: boolean }
) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [...GROUP_KEY, groupId] as const,
    queryFn: async () => {
      if (!groupId) throw new Error('Group ID is required')
      const response = await apiClient.get<ApiResponse<GroupWithMembers>>(
        `/api/groups/${groupId}`
      )
      return response.data
    },
    enabled: options?.enabled !== undefined ? options.enabled && !!groupId : !!groupId,
  })

  return {
    group: data,
    isLoading,
    error,
    refetch,
  }
}
