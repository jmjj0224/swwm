import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

// NEXT_PUBLIC_* 환경 변수는 빌드 타임에 번들에 포함됨
// 따라서 환경 변수 변경 후 반드시 재배포 필요!

// ⚠️ TEMPORARY: 환경 변수가 작동하지 않는 경우 하드코딩 (테스트용)
const FALLBACK_URL = 'https://zsyaclpdkxkcgymejedg.supabase.co'
const FALLBACK_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpzeWFjbHBka3hrY2d5bWVqZWRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0MDI2MTgsImV4cCI6MjA4NDk3ODYxOH0.EFi8NtEAJgGnVLPsUyy7b1NFcW83fWW8FK1G8TGpNag'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || FALLBACK_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || FALLBACK_KEY

// 클라이언트에서만 디버깅 로그 출력
if (typeof window !== 'undefined') {
  console.log('🔍 [SWWM] Supabase 연결 확인')
  console.log('  📍 URL:', supabaseUrl)
  console.log('  🔑 Key:', supabaseAnonKey.slice(0, 20) + '...')

  if (supabaseUrl.includes('placeholder')) {
    console.error('❌ [SWWM] 더미 환경 변수 사용 중!')
    console.error('   ⚠️ Vercel에서 환경 변수 추가 후')
    console.error('   ⚠️ "캐시 없이 재배포" 필요!')
    console.error('')
    console.error('   방법: Deployments → Redeploy → Use existing Build Cache 체크 해제')
  } else {
    console.log('✅ [SWWM] 환경 변수 정상 로드!')
  }
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})

export function createSupabaseClient() {
  return supabase
}
