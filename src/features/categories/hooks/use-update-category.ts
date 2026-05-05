import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import type { Category, UpdateCategoryInput } from '../types'
import type { ApiResponse } from '@/types/api'

const CATEGORIES_KEY = ['categories'] as const

export const useUpdateCategory = () => {
  const queryClient = useQueryClient()

  const { mutateAsync, isPending, error } = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateCategoryInput }) => {
      const response = await apiClient.patch<ApiResponse<Category>>(
        `/api/categories/${id}`,
        data
      )
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORIES_KEY })
    },
  })

  const updateCategory = async ({ id, data }: { id: string; data: UpdateCategoryInput }) => {
    try {
      return await mutateAsync({ id, data })
    } catch (error) {
      throw new Error('Failed to update category')
    }
  }

  return {
    updateCategory,
    isUpdating: isPending,
    error,
  }
}
