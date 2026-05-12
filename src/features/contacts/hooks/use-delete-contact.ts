import { apiClient } from '@/lib/api-client'
import type { ApiResponse } from '@/types/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'

const CONTACT_STATS_KEY = ['contact-stats'] as const

export const useDeleteContact = () => {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async (contactId: string) => {
      const response = await apiClient.delete<ApiResponse<void>>(`/api/contacts/${contactId}`)
      return response
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] })
      queryClient.invalidateQueries({ queryKey: CONTACT_STATS_KEY })
    },
  })

  return {
    deleteContact: mutation.mutateAsync,
    isDeleting: mutation.isPending,
    error: mutation.error,
  }
}
