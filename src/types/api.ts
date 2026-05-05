export type ApiResponse<T> = {
  data: T
  message?: string
}

export type ApiError = {
  error: string
  message: string
  statusCode: number
  details?: Record<string, string[]>
}

export type PaginatedResponse<T> = {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}

export type DateRange = {
  startDate?: Date | string
  endDate?: Date | string
}

export type SortOptions = {
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export type FilterOptions = DateRange & SortOptions & {
  page?: number
  limit?: number
  search?: string
}
