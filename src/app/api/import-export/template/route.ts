import { NextResponse } from 'next/server'
import { requireCurrentUser } from '@/lib/auth'
import { csvService } from '@/features/import-export/services/csv-service'
import type { ApiError } from '@/types/api'

export async function GET() {
  try {
    const user = await requireCurrentUser()
    const buffer = await csvService.generateTemplate(user.id)

    return new NextResponse(buffer as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="expense-import-template.xlsx"',
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to generate template'
    return NextResponse.json<ApiError>(
      { error: 'GenerateError', message, statusCode: 500 },
      { status: 500 }
    )
  }
}
