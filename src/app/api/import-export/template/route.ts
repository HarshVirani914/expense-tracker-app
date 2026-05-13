import { NextResponse } from 'next/server'
import { csvService } from '@/features/import-export/services/csv-service'

export async function GET() {
  try {
    const csv = csvService.generateTemplate()

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="expense-template.csv"',
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to generate template'
    return NextResponse.json(
      { error: 'GenerateError', message },
      { status: 500 }
    )
  }
}
