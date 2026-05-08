import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import type { SettlementWithRelations, CreateSettlementInput } from '../types'
import type { ApiResponse } from '@/types/api'

export const useCreateSettlement = () => {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async (data: CreateSettlementInput) => {
      const response = await apiClient.post<ApiResponse<SettlementWithRelations>>(
        '/api/settlements',
        data
      )
      return response.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['settlements'] })
      queryClient.invalidateQueries({ queryKey: ['group-balances', variables.groupId] })
      queryClient.invalidateQueries({ queryKey: ['outstanding-debts'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['groups'] })
    },
  })

  return {
    createSettlement: mutation.mutateAsync,
    isCreating: mutation.isPending,
    error: mutation.error,
  }
}
