import { NextResponse } from 'next/server'
import { requireCurrentUser } from '@/lib/auth'
import { csvService } from '@/features/import-export/services/csv-service'
import type { ApiResponse, ApiError } from '@/types/api'
import type { ImportResult } from '@/features/import-export/types'

const ACCEPTED_EXTENSIONS = ['.csv', '.xlsx']

export async function POST(request: Request) {
  try {
    const user = await requireCurrentUser()
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json<ApiError>(
        { error: 'ValidationError', message: 'No file provided', statusCode: 400 },
        { status: 400 }
      )
    }

    const isCSV = file.name.endsWith('.csv')
    const isXLSX = file.name.endsWith('.xlsx')

    if (!isCSV && !isXLSX) {
      return NextResponse.json<ApiError>(
        {
          error: 'ValidationError',
          message: `File must be one of: ${ACCEPTED_EXTENSIONS.join(', ')}`,
          statusCode: 400,
        },
        { status: 400 }
      )
    }

    if (file.size / 1024 / 1024 > 5) {
      return NextResponse.json<ApiError>(
        { error: 'ValidationError', message: 'File size must be less than 5MB', statusCode: 400 },
        { status: 400 }
      )
    }

    const rows = isXLSX
      ? await csvService.parseXLSX(await file.arrayBuffer())
      : csvService.parseCSV(await file.text())

    if (rows.length === 0) {
      return NextResponse.json<ApiError>(
        { error: 'ValidationError', message: 'File contains no data rows', statusCode: 400 },
        { status: 400 }
      )
    }

    const result = await csvService.importExpenses(rows, user.id)

    return NextResponse.json<ApiResponse<ImportResult>>({
      data: result,
      message: `Imported ${result.success} expenses successfully`,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to import expenses'
    return NextResponse.json<ApiError>(
      { error: 'ImportError', message, statusCode: 500 },
      { status: 500 }
    )
  }
}
