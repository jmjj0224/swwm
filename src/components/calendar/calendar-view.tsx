'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { DateGrid } from '@/components/calendar/date-grid'
import { BestTimeSuggestions } from '@/components/suggestions/best-time-suggestions'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { addMonths, subMonths, formatKoreanDate } from '@/lib/calendar/date-utils'

interface CalendarViewProps {
  roomCode: string
  roomId: string
}

export function CalendarView({ roomCode, roomId }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const handlePrevMonth = () => {
    setCurrentMonth((prev) => subMonths(prev, 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth((prev) => addMonths(prev, 1))
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
    </div>
  )
}
