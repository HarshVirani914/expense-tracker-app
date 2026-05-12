import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import type { ApiResponse } from '@/types/api'
import { GROUP_STATS_KEY } from './use-group-stats'

export const useDeleteGroup = () => {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async (groupId: string) => {
      const response = await apiClient.delete<ApiResponse<void>>(`/api/groups/${groupId}`)
      return response
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] })
      queryClient.invalidateQueries({ queryKey: GROUP_STATS_KEY })
    },
  })

  return {
    deleteGroup: mutation.mutateAsync,
    isDeleting: mutation.isPending,
    error: mutation.error,
  }
}
