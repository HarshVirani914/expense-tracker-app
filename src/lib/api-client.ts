import type { ApiError } from '@/types/api'

export class ApiClientError extends Error {
  statusCode: number
  details?: Record<string, string[]>

  constructor(message: string, statusCode: number, details?: Record<string, string[]>) {
    super(message)
    this.name = 'ApiClientError'
    this.statusCode = statusCode
    this.details = details
  }
}

type FetchOptions = RequestInit & {
  params?: Record<string, string | number | boolean | Date | undefined>
}

export const apiClient = {
  async request<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
    const { params, ...fetchOptions } = options

    let url = endpoint

    if (params) {
      const searchParams = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          const stringValue = value instanceof Date ? value.toISOString() : String(value)
          searchParams.append(key, stringValue)
        }
      })
      const queryString = searchParams.toString()
      if (queryString) {
        url = `${endpoint}?${queryString}`
      }
    }

    const response = await fetch(url, {
      ...fetchOptions,
      headers: {
        'Content-Type': 'application/json',
        ...fetchOptions.headers,
      },
    })

    if (!response.ok) {
      let errorData: ApiError
      try {
        errorData = await response.json()
      } catch {
        errorData = {
          error: 'ApiError',
          message: response.statusText || 'An error occurred',
          statusCode: response.status,
        }
      }

      throw new ApiClientError(
        errorData.message,
        errorData.statusCode,
        errorData.details
      )
    }

    return response.json()
  },

  get<T>(endpoint: string, params?: Record<string, string | number | boolean | Date | undefined>) {
    return this.request<T>(endpoint, { method: 'GET', params })
  },

  post<T>(endpoint: string, data?: unknown) {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  patch<T>(endpoint: string, data?: unknown) {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },

  delete<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'DELETE' })
  },
}
