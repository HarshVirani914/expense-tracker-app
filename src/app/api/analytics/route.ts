import { NextResponse } from 'next/server'
import { requireCurrentUser } from '@/lib/auth'
import { analyticsService } from '@/features/analytics/services/analytics-service'
import { analyticsFiltersSchema } from '@/features/analytics/schemas'
import type { ApiResponse, ApiError } from '@/types/api'
import type { AnalyticsData } from '@/features/analytics/types'

export async function GET(request: Request) {
  try {
    const user = await requireCurrentUser()
    const { searchParams } = new URL(request.url)

    const filters = Object.fromEntries(searchParams.entries())
    const validatedFilters = analyticsFiltersSchema.parse(filters)

    const analytics = await analyticsService.getAnalytics(user.id, validatedFilters)

    return NextResponse.json<ApiResponse<AnalyticsData>>({
      data: analytics,
      message: 'Analytics retrieved successfully',
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

    const message = error instanceof Error ? error.message : 'Failed to fetch analytics'
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
