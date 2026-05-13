import { NextResponse } from 'next/server'
import { requireCurrentUser } from '@/lib/auth'
import { recurringExpenseService } from '@/features/recurring-expenses/services/recurring-expense-service'
import type { ApiResponse, ApiError } from '@/types/api'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireCurrentUser()
    const { id } = await params

    const recurringExpense = await recurringExpenseService.toggleActive(id, user.id)

    return NextResponse.json<ApiResponse<any>>({
      data: recurringExpense,
      message: `Recurring expense ${recurringExpense.isActive ? 'activated' : 'paused'}`,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to toggle recurring expense'
    return NextResponse.json<ApiError>(
      {
        error: 'ToggleError',
        message,
        statusCode: 400,
      },
      { status: 400 }
    )
  }
}
