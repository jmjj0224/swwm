import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// 디버깅: 환경 변수 로드 확인
console.log('🔍 Supabase 환경 변수 확인:')
console.log('  URL:', supabaseUrl ? `${supabaseUrl.slice(0, 30)}...` : '❌ 없음')
console.log('  Key:', supabaseAnonKey ? `${supabaseAnonKey.slice(0, 20)}...` : '❌ 없음')

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase 환경 변수가 설정되지 않았습니다!')
  console.error('   Vercel 대시보드에서 다음 변수를 확인하세요:')
  console.error('   - NEXT_PUBLIC_SUPABASE_URL')
  console.error('   - NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

// 빌드 타임에 환경 변수가 없으면 더미 값 사용 (런타임에는 실제 값 필요)
const url = supabaseUrl || 'https://placeholder.supabase.co'
const key = supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDk3MjcyMDAsImV4cCI6MTk2NTMwMzIwMH0.fakekeyforbuild'

export const supabase = createClient<Database>(url, key, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})

export function createSupabaseClient() {
  return supabase
}
