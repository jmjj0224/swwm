'use client'

import { useState } from 'react'
import { CreateRoom } from '@/components/room/create-room'
import { JoinRoom } from '@/components/room/join-room'
import { Button } from '@/components/ui/button'
import { SupabaseTest } from '@/components/debug/supabase-test'

export default function HomePage() {
  const [mode, setMode] = useState<'create' | 'join' | null>(null)

  return (
    <main className="min-h-screen bg-gradient-to-b from-ios-gray to-white">
      <div className="container max-w-md mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-2">
            약속 캘린더
          </h1>
          <p className="text-gray-600">
            비는 시간을 공유하고 최적의 약속 시간을 찾아보세요
          </p>
        </div>

        {!mode && (
          <div className="space-y-4">
            <Button
              onClick={() => setMode('create')}
              size="lg"
              className="w-full"
            >
              방 만들기
            </Button>
            <Button
              onClick={() => setMode('join')}
              variant="outline"
              size="lg"
              className="w-full"
            >
              방 들어가기
            </Button>
          </div>
        )}

        {mode === 'create' && (
          <div className="space-y-4">
            <CreateRoom />
            <Button
              onClick={() => setMode(null)}
              variant="ghost"
              className="w-full"
            >
              돌아가기
            </Button>
          </div>
        )}

        {mode === 'join' && (
          <div className="space-y-4">
            <JoinRoom />
            <Button
              onClick={() => setMode(null)}
              variant="ghost"
              className="w-full"
            >
              돌아가기
            </Button>
          </div>
        )}

        {/* 개발용 디버그 도구 */}
        <SupabaseTest />
      </div>
    </main>
  )
}
