import { NextResponse } from 'next/server'
import { requireCurrentUser } from '@/lib/auth'
import { settlementService } from '@/features/settlements/services/settlement-service'
import type { PaginatedResponse, ApiError } from '@/types/api'
import type { SettlementWithRelations } from '@/features/settlements/types'

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function GET(request: Request, context: RouteContext) {
  try {
    const user = await requireCurrentUser()
    const { id: groupId } = await context.params

    const settlements = await settlementService.list(user.id, { groupId, page: 1, limit: 100 })

    return NextResponse.json<PaginatedResponse<SettlementWithRelations>>(settlements)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch settlements'
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
