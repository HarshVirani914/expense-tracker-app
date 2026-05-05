import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'

const ACCOUNTS_KEY = ['accounts'] as const

export const useDeleteAccount = () => {
  const queryClient = useQueryClient()

  const { mutateAsync, isPending, error } = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/api/accounts/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ACCOUNTS_KEY })
    },
  })

  const deleteAccount = async (id: string) => {
    try {
      return await mutateAsync(id)
    } catch (error) {
      throw new Error('Failed to delete account')
    }
  }

  return {
    deleteAccount,
    isDeleting: isPending,
    error,
  }
}
