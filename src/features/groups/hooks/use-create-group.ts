import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import type { GroupWithMembers, CreateGroupInput } from '../types'
import type { ApiResponse } from '@/types/api'

export const useCreateGroup = () => {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async (data: CreateGroupInput) => {
      const response = await apiClient.post<ApiResponse<GroupWithMembers>>(
        '/api/groups',
        data
      )
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] })
    },
  })

  return {
    createGroup: mutation.mutateAsync,
    isCreating: mutation.isPending,
    error: mutation.error,
  }
}
