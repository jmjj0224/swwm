'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CreateRoom } from '@/components/room/create-room'
import { JoinRoom } from '@/components/room/join-room'
import { Button } from '@/components/ui/button'
import { AdBanner } from '@/components/ads/ad-banner'

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

        {/* 광고 - AdSense 승인 후 표시됨 */}
        <AdBanner className="mt-12" />

        {/* 푸터 링크 */}
        <footer className="mt-12 pt-8 border-t text-center space-y-2">
          <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600">
            <Link href="/about" className="hover:text-blue-600 transition">
              소개
            </Link>
            <Link href="/privacy" className="hover:text-blue-600 transition">
              개인정보처리방침
            </Link>
            <Link href="/terms" className="hover:text-blue-600 transition">
              이용약관
            </Link>
          </div>
          <p className="text-xs text-gray-500">
            © 2025 SWWM. All rights reserved.
          </p>
        </footer>
      </div>
    </main>
  )
}
