import { settlementDashboardService } from '@/features/settlements/services/settlement-dashboard-service'
import { requireCurrentUser } from '@/lib/auth'
import type { ApiError, ApiResponse } from '@/types/api'
import { NextResponse } from 'next/server'

type OutstandingDebt = {
  groupId: string
  groupName: string
  memberName: string
  memberId: string
  isUser: boolean
  amount: number
  type: 'owes' | 'owed'
}

export async function GET() {
  try {
    const user = await requireCurrentUser()

    const debts = await settlementDashboardService.getOutstandingDebts(user.id)

    return NextResponse.json<ApiResponse<OutstandingDebt[]>>({
      data: debts,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch outstanding debts'

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
