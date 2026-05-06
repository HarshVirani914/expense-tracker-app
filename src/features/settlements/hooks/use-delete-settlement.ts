import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import type { ApiResponse } from '@/types/api'

export const useDeleteSettlement = () => {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async (settlementId: string) => {
      const response = await apiClient.delete<ApiResponse<void>>(`/api/settlements/${settlementId}`)
      return response
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settlements'] })
      queryClient.invalidateQueries({ queryKey: ['group-balances'] })
    },
  })

  return {
    deleteSettlement: mutation.mutateAsync,
    isDeleting: mutation.isPending,
    error: mutation.error,
  }
}
