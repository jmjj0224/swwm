'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { DateGrid } from '@/components/calendar/date-grid'
import { BestTimeSuggestions } from '@/components/suggestions/best-time-suggestions'
import { ChevronLeft, ChevronRight, Share2, Check } from 'lucide-react'
import { addMonths, subMonths, formatKoreanDate } from '@/lib/calendar/date-utils'

interface CalendarViewProps {
  roomCode: string
  roomId: string
}

export function CalendarView({ roomCode, roomId }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [copied, setCopied] = useState(false)

  const handlePrevMonth = () => {
    setCurrentMonth((prev) => subMonths(prev, 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth((prev) => addMonths(prev, 1))
  }

  const handleShareRoom = async () => {
    const url = `${window.location.origin}/room/${roomCode}`

    // 클립보드 복사
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      // 클립보드 API 실패 시 대체 방법
      alert(`방 URL:\n${url}\n\n(수동으로 복사해주세요)`)
    }
  }

  return (
    <div className="space-y-6">
      {/* 월 네비게이션 */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          onClick={handlePrevMonth}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>

        <h2 className="text-2xl font-bold">
          {formatKoreanDate(currentMonth, 'yyyy년 M월')}
        </h2>

        <Button
          variant="ghost"
          size="icon"
          onClick={handleNextMonth}
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* 날짜 그리드 */}
      <DateGrid
        currentMonth={currentMonth}
        roomCode={roomCode}
        roomId={roomId}
      />

      {/* 최적 시간 제안 */}
      <BestTimeSuggestions roomId={roomId} />

      {/* 방 공유하기 */}
      <Button
        onClick={handleShareRoom}
        variant="outline"
        size="lg"
        className="w-full"
      >
        {copied ? (
          <>
            <Check className="h-5 w-5 mr-2 text-green-500" />
            링크 복사됨!
          </>
        ) : (
          <>
            <Share2 className="h-5 w-5 mr-2" />
            방 공유하기
          </>
        )}
      </Button>
    </div>
  )
}
