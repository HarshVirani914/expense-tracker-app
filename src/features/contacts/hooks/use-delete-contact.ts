import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import type { ApiResponse } from '@/types/api'

export const useDeleteContact = () => {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async (contactId: string) => {
      const response = await apiClient.delete<ApiResponse<void>>(`/api/contacts/${contactId}`)
      return response
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] })
    },
  })

  return {
    deleteContact: mutation.mutateAsync,
    isDeleting: mutation.isPending,
    error: mutation.error,
  }
}
