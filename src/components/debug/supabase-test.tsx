'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase } from '@/lib/supabase/client'

export function SupabaseTest() {
  const [testResult, setTestResult] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)

  const runTest = async () => {
    setIsLoading(true)
    setTestResult('테스트 중...')

    const results: string[] = []

    // 1. 환경 변수 확인
    results.push('=== 환경 변수 확인 ===')
    results.push(`SUPABASE_URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ 설정됨' : '❌ 없음'}`)
    results.push(`SUPABASE_ANON_KEY: ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ 설정됨' : '❌ 없음'}`)
    results.push('')

    // 2. Supabase 연결 테스트
    results.push('=== Supabase 연결 테스트 ===')
    try {
      const { data, error } = await supabase.from('rooms').select('count').limit(1)

      if (error) {
        results.push(`❌ 연결 실패: ${error.message}`)
        if (error.hint) results.push(`   힌트: ${error.hint}`)
        if (error.details) results.push(`   상세: ${error.details}`)
      } else {
        results.push('✅ 연결 성공!')
      }
    } catch (err: any) {
      results.push(`❌ 오류: ${err.message}`)
    }
    results.push('')

    // 3. rooms 테이블 확인
    results.push('=== rooms 테이블 확인 ===')
    try {
      const { data, error } = await supabase.from('rooms').select('*').limit(1)

      if (error) {
        results.push(`❌ 테이블 조회 실패: ${error.message}`)
        if (error.code === '42P01') {
          results.push('   → rooms 테이블이 존재하지 않습니다!')
          results.push('   → Supabase Dashboard에서 마이그레이션을 실행해주세요.')
        }
      } else {
        results.push(`✅ 테이블 존재 (현재 방 개수: ${data?.length || 0})`)
      }
    } catch (err: any) {
      results.push(`❌ 오류: ${err.message}`)
    }

    setTestResult(results.join('\n'))
    setIsLoading(false)
  }

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-sm">🔧 Supabase 연결 테스트</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={runTest} disabled={isLoading} size="sm" className="w-full">
          {isLoading ? '테스트 중...' : '연결 테스트 실행'}
        </Button>

        {testResult && (
          <pre className="bg-gray-100 p-4 rounded-lg text-xs overflow-auto max-h-64">
            {testResult}
          </pre>
        )}
      </CardContent>
    </Card>
  )
}
