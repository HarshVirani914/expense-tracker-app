import { NextResponse } from 'next/server'
import { requireCurrentUser } from '@/lib/auth'
import { csvService } from '@/features/import-export/services/csv-service'
import type { ApiResponse, ApiError } from '@/types/api'

type PreviewResult = {
  columns: string[]
  rows: Record<string, string>[]
}

export async function POST(request: Request) {
  try {
    await requireCurrentUser()

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json<ApiError>(
        { error: 'ValidationError', message: 'No file provided', statusCode: 400 },
        { status: 400 }
      )
    }

    const rows = file.name.endsWith('.xlsx')
      ? await csvService.parseXLSX(await file.arrayBuffer())
      : csvService.parseCSV(await file.text())

    const columns = rows.length > 0 ? Object.keys(rows[0]) : []

    return NextResponse.json<ApiResponse<PreviewResult>>({
      data: {
        columns,
        rows: rows.slice(0, 5) as unknown as Record<string, string>[],
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to parse file'
    return NextResponse.json<ApiError>(
      { error: 'PreviewError', message, statusCode: 500 },
      { status: 500 }
    )
  }
}
