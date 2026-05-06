import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import type { ContactWithRelations } from '../types'
import type { ApiResponse } from '@/types/api'

const CONTACT_KEY = ['contact'] as const

export const useContact = (contactId?: string) => {
  const { data, isLoading, error } = useQuery({
    queryKey: [...CONTACT_KEY, contactId] as const,
    queryFn: async () => {
      if (!contactId) throw new Error('Contact ID is required')
      const response = await apiClient.get<ApiResponse<ContactWithRelations>>(
        `/api/contacts/${contactId}`
      )
      return response.data
    },
    enabled: !!contactId,
  })

  return {
    contact: data,
    isLoading,
    error,
  }
}
