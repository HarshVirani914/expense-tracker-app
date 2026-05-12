import { NextResponse } from 'next/server'
import { requireCurrentUser } from '@/lib/auth'
import { groupService } from '@/features/groups/services/group-service'
import type { ApiResponse, ApiError } from '@/types/api'
import type { GroupStats } from '@/features/groups/types'

export async function GET() {
  try {
    const user = await requireCurrentUser()
    const stats = await groupService.getStats(user.id)

    return NextResponse.json<ApiResponse<GroupStats>>({
      data: stats,
    })
  } catch (error) {
    const message = error instanceof Error 
      ? error.message 
      : 'Failed to fetch group statistics'
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
