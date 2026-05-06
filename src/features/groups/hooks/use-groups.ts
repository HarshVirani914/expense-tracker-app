import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import type { GroupWithMembers, GroupFilters } from '../types'
import type { PaginatedResponse } from '@/types/api'

const GROUPS_KEY = ['groups'] as const

export const useGroups = (filters?: GroupFilters) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [...GROUPS_KEY, filters] as const,
    queryFn: async () => {
      const response = await apiClient.get<PaginatedResponse<GroupWithMembers>>(
        '/api/groups',
        filters as Record<string, string | number | boolean | undefined>
      )
      return response
    },
  })

  return {
    groups: data?.data,
    pagination: data?.pagination,
    isLoading,
    error,
    refetch,
  }
}
