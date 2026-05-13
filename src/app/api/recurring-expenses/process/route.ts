import { NextResponse } from 'next/server'
import { recurringExpenseService } from '@/features/recurring-expenses/services/recurring-expense-service'
import type { ApiResponse, ApiError } from '@/types/api'

export async function POST() {
  try {
    const result = await recurringExpenseService.processDueRecurringExpenses()

    return NextResponse.json<ApiResponse<typeof result>>({
      data: result,
      message: `Processed ${result.processed} recurring expenses`,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to process recurring expenses'
    return NextResponse.json<ApiError>(
      {
        error: 'ProcessError',
        message,
        statusCode: 500,
      },
      { status: 500 }
    )
  }
}
