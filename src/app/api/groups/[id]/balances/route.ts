import { NextResponse } from 'next/server'
import { requireCurrentUser } from '@/lib/auth'
import { balanceService } from '@/features/groups/services/balance-service'
import type { ApiResponse, ApiError } from '@/types/api'
import type { GroupBalance } from '@/features/groups/types'

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function GET(request: Request, context: RouteContext) {
  try {
    const user = await requireCurrentUser()
    const { id: groupId } = await context.params

    const balances = await balanceService.calculateGroupBalances(groupId, user.id)

    return NextResponse.json<ApiResponse<GroupBalance[]>>({
      data: balances,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to calculate balances'
    const statusCode = message === 'Group not found' ? 404 : 500

    return NextResponse.json<ApiError>(
      {
        error: statusCode === 404 ? 'NotFoundError' : 'CalculationError',
        message,
        statusCode,
      },
      { status: statusCode }
    )
  }
}
