import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase URL or Anon Key is missing. Using dummy values for build.')
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
