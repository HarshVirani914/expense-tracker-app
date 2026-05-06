import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import type { ContactWithRelations, ContactFilters } from '../types'
import type { PaginatedResponse } from '@/types/api'

const CONTACTS_KEY = ['contacts'] as const

export const useContacts = (filters?: ContactFilters) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [...CONTACTS_KEY, filters] as const,
    queryFn: async () => {
      const response = await apiClient.get<PaginatedResponse<ContactWithRelations>>(
        '/api/contacts',
        filters as Record<string, string | number | boolean | undefined>
      )
      return response
    },
  })

  return {
    contacts: data?.data,
    pagination: data?.pagination,
    isLoading,
    error,
    refetch,
  }
}
