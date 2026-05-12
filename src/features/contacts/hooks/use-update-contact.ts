import { apiClient } from '@/lib/api-client'
import type { ApiResponse } from '@/types/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { ContactWithRelations, UpdateContactInput } from '../types'

type UpdateContactParams = {
  id: string
  data: UpdateContactInput
}

const CONTACT_STATS_KEY = ['contact-stats'] as const

export const useUpdateContact = () => {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async ({ id, data }: UpdateContactParams) => {
      const response = await apiClient.patch<ApiResponse<ContactWithRelations>>(
        `/api/contacts/${id}`,
        data
      )
      return response.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] })
      queryClient.invalidateQueries({ queryKey: ['contact', variables.id] })
      queryClient.invalidateQueries({ queryKey: CONTACT_STATS_KEY })
    },
  })

  return {
    updateContact: mutation.mutateAsync,
    isUpdating: mutation.isPending,
    error: mutation.error,
  }
}
