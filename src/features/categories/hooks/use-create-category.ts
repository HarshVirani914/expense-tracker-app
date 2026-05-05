import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import type { Category, CreateCategoryInput } from '../types'
import type { ApiResponse } from '@/types/api'

const CATEGORIES_KEY = ['categories'] as const

export const useCreateCategory = () => {
  const queryClient = useQueryClient()

  const { mutateAsync, isPending, error } = useMutation({
    mutationFn: async (data: CreateCategoryInput) => {
      const response = await apiClient.post<ApiResponse<Category>>(
        '/api/categories',
        data
      )
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORIES_KEY })
    },
  })

  const createCategory = async (data: CreateCategoryInput) => {
    try {
      return await mutateAsync(data)
    } catch (error) {
      throw new Error('Failed to create category')
    }
  }

  return {
    createCategory,
    isCreating: isPending,
    error,
  }
}
