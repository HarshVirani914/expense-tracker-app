import { NextResponse } from 'next/server'
import { requireCurrentUser } from '@/lib/auth'
import { settlementService } from '@/features/settlements/services/settlement-service'
import type { ApiResponse, ApiError } from '@/types/api'

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const user = await requireCurrentUser()
    const { id } = await context.params

    await settlementService.delete(user.id, id)

    return NextResponse.json<ApiResponse<null>>({
      data: null,
      message: 'Settlement deleted successfully',
    })
  } catch (error) {
    if (error instanceof Error) {
      const statusCode = error.message === 'Settlement not found' ? 404 : 400

      return NextResponse.json<ApiError>(
        {
          error: statusCode === 404 ? 'NotFoundError' : 'DeleteError',
          message: error.message,
          statusCode,
        },
        { status: statusCode }
      )
    }

    return NextResponse.json<ApiError>(
      {
        error: 'ServerError',
        message: 'Failed to delete settlement',
        statusCode: 500,
      },
      { status: 500 }
    )
  }
}
