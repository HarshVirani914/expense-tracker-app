import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import type { ContactWithRelations, CreateContactInput } from '../types'
import type { ApiResponse } from '@/types/api'

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
    },
  })

  return {
    createContact: mutation.mutateAsync,
    isCreating: mutation.isPending,
    error: mutation.error,
  }
}
