import { NextResponse } from 'next/server'
import { requireCurrentUser } from '@/lib/auth'
import { analyticsService } from '@/features/analytics/services/analytics-service'
import { analyticsFiltersSchema } from '@/features/analytics/schemas'
import type { ApiResponse, ApiError } from '@/types/api'
import type { SpendingTrend } from '@/features/analytics/types'

export async function GET(request: Request) {
  try {
    const user = await requireCurrentUser()
    const { searchParams } = new URL(request.url)

    const filters = Object.fromEntries(searchParams.entries())
    const validatedFilters = analyticsFiltersSchema.parse(filters)

    let startDate: Date
    let endDate: Date

    if (validatedFilters.startDate && validatedFilters.endDate) {
      startDate = new Date(validatedFilters.startDate)
      endDate = new Date(validatedFilters.endDate)
    } else {
      const now = new Date()
      startDate = new Date(now.getFullYear(), now.getMonth(), 1)
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    }

    const trends = await analyticsService.getSpendingTrends(
      user.id,
      startDate,
      endDate,
      validatedFilters.categoryId
    )

    return NextResponse.json<ApiResponse<SpendingTrend[]>>({
      data: trends,
      message: 'Spending trends retrieved successfully',
    })
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json<ApiError>(
        {
          error: 'ValidationError',
          message: 'Invalid filter parameters',
          statusCode: 400,
          details: JSON.parse(error.message),
        },
        { status: 400 }
      )
    }

    const message = error instanceof Error ? error.message : 'Failed to fetch spending trends'
    return NextResponse.json<ApiError>(
      {
        error: 'FetchError',
        message,
        statusCode: 500,
      },
      { status: 500 }
    )
  }
}
