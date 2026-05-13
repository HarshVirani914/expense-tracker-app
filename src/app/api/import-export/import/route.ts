import { NextResponse } from 'next/server'
import { requireCurrentUser } from '@/lib/auth'
import { csvService } from '@/features/import-export/services/csv-service'
import type { ApiResponse, ApiError } from '@/types/api'
import type { ImportResult } from '@/features/import-export/types'

export async function POST(request: Request) {
  try {
    const user = await requireCurrentUser()
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json<ApiError>(
        {
          error: 'ValidationError',
          message: 'No file provided',
          statusCode: 400,
        },
        { status: 400 }
      )
    }

    if (!file.name.endsWith('.csv')) {
      return NextResponse.json<ApiError>(
        {
          error: 'ValidationError',
          message: 'File must be a CSV',
          statusCode: 400,
        },
        { status: 400 }
      )
    }

    const fileSize = file.size / 1024 / 1024
    if (fileSize > 5) {
      return NextResponse.json<ApiError>(
        {
          error: 'ValidationError',
          message: 'File size must be less than 5MB',
          statusCode: 400,
        },
        { status: 400 }
      )
    }

    const csvText = await file.text()
    const rows = csvService.parseCSV(csvText)

    if (rows.length === 0) {
      return NextResponse.json<ApiError>(
        {
          error: 'ValidationError',
          message: 'CSV file is empty',
          statusCode: 400,
        },
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
      {
        error: 'ImportError',
        message,
        statusCode: 500,
      },
      { status: 500 }
    )
  }
}
