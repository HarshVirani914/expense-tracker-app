import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import type { GroupWithMembers, UpdateGroupInput } from '../types'
import type { ApiResponse } from '@/types/api'

type UpdateGroupParams = {
  id: string
  data: UpdateGroupInput
}

export const useUpdateGroup = () => {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async ({ id, data }: UpdateGroupParams) => {
      const response = await apiClient.patch<ApiResponse<GroupWithMembers>>(
        `/api/groups/${id}`,
        data
      )
      return response.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['groups'] })
      queryClient.invalidateQueries({ queryKey: ['group', variables.id] })
    },
  })

  return {
    updateGroup: mutation.mutateAsync,
    isUpdating: mutation.isPending,
    error: mutation.error,
  }
}
