import { NextResponse } from 'next/server'
import { requireCurrentUser } from '@/lib/auth'
import { budgetService } from '@/features/budgets/services/budget-service'
import type { ApiResponse, ApiError } from '@/types/api'
import type { BudgetAlert } from '@/features/budgets/types'

export async function GET() {
  try {
    const user = await requireCurrentUser()
    const alerts = await budgetService.checkBudgetAlerts(user.id)

    return NextResponse.json<ApiResponse<BudgetAlert[]>>({
      data: alerts,
      message: 'Budget alerts retrieved successfully',
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch budget alerts'
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
