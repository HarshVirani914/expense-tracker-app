import { NextResponse } from 'next/server'
import { requireCurrentUser } from '@/lib/auth'
import { dashboardService } from '@/features/dashboard/services/dashboard-service'
import { cachedJson } from '@/lib/api-response'
import type { ApiResponse, ApiError } from '@/types/api'
import type { DashboardStats } from '@/features/dashboard/types'

export async function GET() {
  try {
    const user = await requireCurrentUser()

    const stats = await dashboardService.getStats(user.id)

    return cachedJson<ApiResponse<DashboardStats>>({ data: stats })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to fetch dashboard statistics'
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
