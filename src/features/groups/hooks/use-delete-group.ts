import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import type { ApiResponse } from '@/types/api'

export const useDeleteGroup = () => {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async (groupId: string) => {
      const response = await apiClient.delete<ApiResponse<void>>(`/api/groups/${groupId}`)
      return response
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] })
    },
  })

  return {
    deleteGroup: mutation.mutateAsync,
    isDeleting: mutation.isPending,
    error: mutation.error,
  }
}
