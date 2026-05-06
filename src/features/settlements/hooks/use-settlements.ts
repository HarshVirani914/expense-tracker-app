import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import type { SettlementWithRelations, SettlementFilters } from '../types'
import type { PaginatedResponse } from '@/types/api'

const SETTLEMENTS_KEY = ['settlements'] as const

export const useSettlements = (filters?: SettlementFilters) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [...SETTLEMENTS_KEY, filters] as const,
    queryFn: async () => {
      const response = await apiClient.get<PaginatedResponse<SettlementWithRelations>>(
        '/api/settlements',
        filters as Record<string, string | number | boolean | undefined>
      )
      return response
    },
  })

  return {
    settlements: data?.data,
    pagination: data?.pagination,
    isLoading,
    error,
    refetch,
  }
}
