import { NextResponse } from 'next/server'
import { requireCurrentUser } from '@/lib/auth'
import { csvService } from '@/features/import-export/services/csv-service'
import { exportFiltersSchema } from '@/features/import-export/schemas'
import type { ApiError } from '@/types/api'
import { format } from 'date-fns'

export async function POST(request: Request) {
  try {
    const user = await requireCurrentUser()
    const body = await request.json()

    const validatedFilters = exportFiltersSchema.parse(body)
    const csv = await csvService.exportExpenses(user.id, validatedFilters)

    const filename = `expenses-${format(new Date(), 'yyyy-MM-dd')}.csv`

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json<ApiError>(
        {
          error: 'ValidationError',
          message: 'Invalid filter parameters',
          statusCode: 400,
          details: JSON.parse(error.message),
        },
        { status: 400 }
      )
    }

    const message = error instanceof Error ? error.message : 'Failed to export expenses'
    return NextResponse.json<ApiError>(
      {
        error: 'ExportError',
        message,
        statusCode: 500,
      },
      { status: 500 }
    )
  }
}
