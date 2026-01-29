/**
 * 간단한 in-memory rate limiting
 * 서버리스 환경에서는 완벽하지 않지만 기본적인 보호 제공
 * 프로덕션에서는 Upstash Redis나 Vercel Edge Config 사용 권장
 */

interface RateLimitEntry {
  count: number
  resetTime: number
}

// 메모리 저장소 (서버리스 환경에서는 각 요청마다 초기화될 수 있음)
const rateLimitStore = new Map<string, RateLimitEntry>()

// 정리 주기 (5분마다)
const CLEANUP_INTERVAL = 5 * 60 * 1000

// 마지막 정리 시간
let lastCleanup = Date.now()

// 오래된 항목 정리
function cleanup() {
  const now = Date.now()
  if (now - lastCleanup < CLEANUP_INTERVAL) return

  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key)
    }
  }
  lastCleanup = now
}

export interface RateLimitOptions {
  limit: number // 허용 요청 수
  window: number // 시간 윈도우 (밀리초)
}

export interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  reset: number
  retryAfter?: number
}

/**
 * Rate limiting 체크
 */
export function rateLimit(
  identifier: string,
  options: RateLimitOptions = { limit: 10, window: 60000 } // 기본: 1분에 10회
): RateLimitResult {
  // 정리 실행
  cleanup()

  const now = Date.now()
  const entry = rateLimitStore.get(identifier)

  // 첫 요청이거나 윈도우가 지난 경우
  if (!entry || now > entry.resetTime) {
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + options.window,
    })

    return {
      success: true,
      limit: options.limit,
      remaining: options.limit - 1,
      reset: now + options.window,
    }
  }

  // 제한 초과
  if (entry.count >= options.limit) {
    return {
      success: false,
      limit: options.limit,
      remaining: 0,
      reset: entry.resetTime,
      retryAfter: Math.ceil((entry.resetTime - now) / 1000), // 초 단위
    }
  }

  // 카운트 증가
  entry.count++
  rateLimitStore.set(identifier, entry)

  return {
    success: true,
    limit: options.limit,
    remaining: options.limit - entry.count,
    reset: entry.resetTime,
  }
}

/**
 * IP 주소 기반 rate limiting
 */
export function rateLimitByIP(
  ip: string | null,
  options?: RateLimitOptions
): RateLimitResult {
  if (!ip) {
    // IP를 가져올 수 없으면 기본 제한 적용
    return rateLimit('unknown', options)
  }
  return rateLimit(`ip:${ip}`, options)
}

/**
 * 사용자 ID 기반 rate limiting
 */
export function rateLimitByUser(
  userId: string,
  options?: RateLimitOptions
): RateLimitResult {
  return rateLimit(`user:${userId}`, options)
}

/**
 * 방 코드 기반 rate limiting
 */
export function rateLimitByRoom(
  roomCode: string,
  options?: RateLimitOptions
): RateLimitResult {
  return rateLimit(`room:${roomCode}`, options)
}

/**
 * Rate limit 결과를 HTTP 헤더로 변환
 */
export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  const headers: Record<string, string> = {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': result.reset.toString(),
  }

  if (result.retryAfter) {
    headers['Retry-After'] = result.retryAfter.toString()
  }

  return headers
}

/**
 * IP 주소 추출 (Next.js Request)
 */
export function getClientIP(headers: Headers): string | null {
  // Vercel, Cloudflare 등의 프록시 헤더 확인
  const forwarded = headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }

  const realIp = headers.get('x-real-ip')
  if (realIp) {
    return realIp
  }

  return null
}
