import { NextResponse } from 'next/server'
import { z } from 'zod'
import { requireCurrentUser } from '@/lib/auth'
import { smartImportService } from '@/features/import-export/services/smart-import-service'
import { confirmSmartImportSchema } from '@/features/import-export/schemas'
import type { ApiResponse, ApiError } from '@/types/api'
import type { SmartImportConfirmResult } from '@/features/import-export/types'

export async function POST(request: Request) {
  try {
    const user = await requireCurrentUser()
    const body = await request.json()
    const validated = confirmSmartImportSchema.parse(body)

    const result = await smartImportService.confirmSmartImport(
      user.id,
      validated.sessionId,
      validated.rows,
    )

    return NextResponse.json<ApiResponse<SmartImportConfirmResult>>({
      data: result,
      message: `Imported ${result.imported} expense${result.imported !== 1 ? 's' : ''}`,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json<ApiError>(
        {
          error: 'ValidationError',
          message: 'Invalid import data',
          statusCode: 400,
        },
        { status: 400 },
      )
    }

    const message =
      error instanceof Error ? error.message : 'Failed to confirm import'
    const statusCode =
      message.includes('Invalid import') ||
      message.includes('no longer active') ||
      message.includes('Select at least')
        ? 400
        : 500

    return NextResponse.json<ApiError>(
      { error: 'ConfirmError', message, statusCode },
      { status: statusCode },
    )
  }
}
