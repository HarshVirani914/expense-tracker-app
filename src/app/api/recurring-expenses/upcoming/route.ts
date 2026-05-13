import { NextResponse } from 'next/server'
import { requireCurrentUser } from '@/lib/auth'
import { recurringExpenseService } from '@/features/recurring-expenses/services/recurring-expense-service'
import type { ApiResponse, ApiError } from '@/types/api'

export async function GET(request: Request) {
  try {
    const user = await requireCurrentUser()
    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '7')

    const upcoming = await recurringExpenseService.getUpcoming(user.id, days)

    return NextResponse.json<ApiResponse<any>>({
      data: upcoming,
      message: 'Upcoming recurring expenses retrieved successfully',
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch upcoming recurring expenses'
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
