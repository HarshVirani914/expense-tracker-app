import { apiClient } from '@/lib/api-client'
import type { ApiResponse } from '@/types/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { ContactWithRelations, CreateContactInput } from '../types'

const CONTACT_STATS_KEY = ['contact-stats'] as const

export const useCreateContact = () => {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async (data: CreateContactInput) => {
      const response = await apiClient.post<ApiResponse<ContactWithRelations>>(
        '/api/contacts',
        data
      )
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] })
      queryClient.invalidateQueries({ queryKey: CONTACT_STATS_KEY })
    },
  })

  return {
    createContact: mutation.mutateAsync,
    isCreating: mutation.isPending,
    error: mutation.error,
  }
}
