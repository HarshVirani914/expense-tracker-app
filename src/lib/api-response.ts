import { NextResponse } from 'next/server'

// Browser-only (private) cache headers for authenticated API GET responses.
// max-age=30  → serve from browser cache for up to 30s (instant repeat loads)
// stale-while-revalidate=300 → serve stale up to 5min while refreshing in bg
// This complements TanStack Query's in-memory staleTime without exposing
// user data to CDN/proxy caches (private ensures that).
const CACHE_HEADERS = {
  'Cache-Control': 'private, max-age=30, stale-while-revalidate=300',
}

export function cachedJson<T>(data: T, init?: ResponseInit): NextResponse<T> {
  return NextResponse.json(data, {
    ...init,
    headers: {
      ...CACHE_HEADERS,
      ...(init?.headers ?? {}),
    },
  })
}

// For mutating responses (POST/PATCH/DELETE) — must not be cached
export function noStoreJson<T>(data: T, init?: ResponseInit): NextResponse<T> {
  return NextResponse.json(data, {
    ...init,
    headers: {
      'Cache-Control': 'no-store',
      ...(init?.headers ?? {}),
    },
  })
}
