import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'

const CATEGORIES_KEY = ['categories'] as const

export const useDeleteCategory = () => {
  const queryClient = useQueryClient()

  const { mutateAsync, isPending, error } = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/api/categories/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORIES_KEY })
    },
  })

  const deleteCategory = async (id: string) => {
    try {
      return await mutateAsync(id)
    } catch (error) {
      throw new Error('Failed to delete category')
    }
  }

  return {
    deleteCategory,
    isDeleting: isPending,
    error,
  }
}
