import { NextResponse } from 'next/server'
import { requireCurrentUser } from '@/lib/auth'
import { smartImportService } from '@/features/import-export/services/smart-import-service'
import type { ApiResponse, ApiError } from '@/types/api'
import type { SmartImportAnalyzeResult } from '@/features/import-export/types'

const MAX_TEXT_LENGTH = 10_000
const MAX_IMAGES = 4

export async function POST(request: Request) {
  try {
    const user = await requireCurrentUser()
    const formData = await request.formData()
    const mode = formData.get('mode')

    if (mode === 'text') {
      const text = formData.get('text')
      if (typeof text !== 'string' || !text.trim()) {
        return NextResponse.json<ApiError>(
          {
            error: 'ValidationError',
            message: 'Text content is required',
            statusCode: 400,
          },
          { status: 400 },
        )
      }

      if (text.length > MAX_TEXT_LENGTH) {
        return NextResponse.json<ApiError>(
          {
            error: 'ValidationError',
            message: `Text exceeds ${MAX_TEXT_LENGTH} character limit`,
            statusCode: 400,
          },
          { status: 400 },
        )
      }

      const result = await smartImportService.analyzeForImport(user.id, {
        mode: 'text',
        text,
        fileName: 'pasted-text.txt',
      })

      return NextResponse.json<ApiResponse<SmartImportAnalyzeResult>>({
        data: result,
        message: `Found ${result.rows.length} transaction${result.rows.length !== 1 ? 's' : ''}`,
      })
    }

    if (mode === 'image') {
      const imageFiles = formData
        .getAll('images')
        .filter((entry): entry is File => entry instanceof File)

      if (imageFiles.length === 0) {
        return NextResponse.json<ApiError>(
          {
            error: 'ValidationError',
            message: 'At least one image is required',
            statusCode: 400,
          },
          { status: 400 },
        )
      }

      if (imageFiles.length > MAX_IMAGES) {
        return NextResponse.json<ApiError>(
          {
            error: 'ValidationError',
            message: `Maximum ${MAX_IMAGES} images allowed`,
            statusCode: 400,
          },
          { status: 400 },
        )
      }

      const images = await Promise.all(
        imageFiles.map(async (file) => ({
          data: new Uint8Array(await file.arrayBuffer()),
          mediaType: file.type || 'image/jpeg',
          name: file.name,
        })),
      )

      const result = await smartImportService.analyzeForImport(user.id, {
        mode: 'image',
        images,
      })

      return NextResponse.json<ApiResponse<SmartImportAnalyzeResult>>({
        data: result,
        message: `Found ${result.rows.length} transaction${result.rows.length !== 1 ? 's' : ''}`,
      })
    }

    return NextResponse.json<ApiError>(
      {
        error: 'ValidationError',
        message: 'Invalid mode. Use "text" or "image".',
        statusCode: 400,
      },
      { status: 400 },
    )
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to analyze import data'
    const statusCode =
      message.includes('Rate limit') ||
      message.includes('No transactions') ||
      message.includes('No text') ||
      message.includes('No images')
        ? 400
        : 500

    return NextResponse.json<ApiError>(
      { error: 'AnalyzeError', message, statusCode },
      { status: statusCode },
    )
  }
}
