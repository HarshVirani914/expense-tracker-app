import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import type { ContactWithRelations, UpdateContactInput } from '../types'
import type { ApiResponse } from '@/types/api'

type UpdateContactParams = {
  id: string
  data: UpdateContactInput
}

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
    },
  })

  return {
    updateContact: mutation.mutateAsync,
    isUpdating: mutation.isPending,
    error: mutation.error,
  }
}
