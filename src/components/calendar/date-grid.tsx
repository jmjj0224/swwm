'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { TimeSlotSelector } from '@/components/calendar/time-slot-selector'
import { cn } from '@/lib/utils/cn'
import {
  generateCalendarDates,
  groupDatesByWeek,
  formatKoreanDate,
  isSameMonth,
  isToday,
  isDateSelectable,
} from '@/lib/calendar/date-utils'
import { supabase } from '@/lib/supabase/client'
import { format } from 'date-fns'

interface DateGridProps {
  currentMonth: Date
  roomCode: string
  roomId: string
}

interface DateUserSelection {
  date: string
  users: Array<{
    userId: string
    name: string
    color: string
    hasSelection: boolean
  }>
}

export function DateGrid({ currentMonth, roomCode, roomId }: DateGridProps) {
  const dates = generateCalendarDates(currentMonth)
  const weeks = groupDatesByWeek(dates)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [dateSelections, setDateSelections] = useState<DateUserSelection[]>([])

  const weekDays = ['일', '월', '화', '수', '목', '금', '토']

  // 날짜별 사용자 선택 정보 로드
  useEffect(() => {
    loadDateSelections()

    // Realtime 구독
    const channel = supabase
      .channel(`room:${roomId}:calendar:${currentMonth.getTime()}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'time_selections',
          filter: `room_id=eq.${roomId}`,
        },
        () => {
          loadDateSelections()
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [currentMonth, roomId, dates])

  const loadDateSelections = async () => {
    try {
      // 현재 월의 시작일과 종료일
      const startDate = format(dates[0], 'yyyy-MM-dd')
      const endDate = format(dates[dates.length - 1], 'yyyy-MM-dd')

      // 시간 선택 데이터 조회 (date 필터 제거 - 502 에러 방지)
      const { data: selectionsRaw, error: selectionsError } = await supabase
        .from('time_selections')
        .select('date, user_id')
        .eq('room_id', roomId)

      if (selectionsError) return

      // 클라이언트에서 날짜 범위 필터링
      const selections = selectionsRaw?.filter((s) => {
        const selectionDate = s.date
        return selectionDate >= startDate && selectionDate <= endDate
      })

      // 방의 모든 사용자 조회
      const { data: users, error: usersError } = await supabase
        .from('room_users')
        .select('user_id, name, color')
        .eq('room_id', roomId)

      if (usersError) return

      // 날짜별로 그룹화
      const grouped = dates.reduce((acc, date) => {
        const dateStr = format(date, 'yyyy-MM-dd')

        // 해당 날짜에 선택한 사용자들
        const usersForDate = selections
          ?.filter((s) => s.date === dateStr)
          .map((s) => s.user_id) || []

        // 중복 제거
        const uniqueUsers = Array.from(new Set(usersForDate))

        // 사용자 정보 추가
        const usersWithInfo = uniqueUsers
          .map((userId) => {
            const user = users?.find((u) => u.user_id === userId)
            if (!user) return null

            return {
              userId: user.user_id,
              name: user.name,
              color: user.color,
              hasSelection: true,
            }
          })
          .filter(Boolean)

        acc.push({
          date: dateStr,
          users: usersWithInfo as any,
        })

        return acc
      }, [] as DateUserSelection[])

      setDateSelections(grouped)
    } catch (error) {
      // 에러 무시
    }
  }

  const getUsersForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    const dateData = dateSelections.find((d) => d.date === dateStr)
    return dateData?.users || []
  }

  return (
    <div className="space-y-4">
      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {weekDays.map((day, index) => (
          <div
            key={day}
            className={cn(
              'text-center text-sm font-semibold py-2',
              index === 0 && 'text-red-500', // 일요일
              index === 6 && 'text-blue-500' // 토요일
            )}
          >
            {day}
          </div>
        ))}
      </div>

      {/* 날짜 그리드 */}
      <div className="space-y-2">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7 gap-2">
            {week.map((date, dayIndex) => {
              const isCurrentMonth = isSameMonth(date, currentMonth)
              const isCurrentDay = isToday(date)
              const isSelectable = isDateSelectable(date)
              const users = getUsersForDate(date)

              return (
                <Card
                  key={dayIndex}
                  className={cn(
                    'aspect-square flex flex-col items-center justify-between p-2 cursor-pointer transition-all hover:shadow-md',
                    !isCurrentMonth && 'opacity-40',
                    !isSelectable && 'opacity-30 cursor-not-allowed bg-gray-100',
                    isCurrentDay && 'ring-2 ring-ios-blue',
                    isSelectable && 'hover:bg-ios-gray'
                  )}
                  onClick={() => {
                    if (isSelectable) {
                      setSelectedDate(date)
                    }
                  }}
                >
                  {/* 날짜 */}
                  <div className="text-center w-full">
                    <div
                      className={cn(
                        'text-lg font-semibold',
                        isCurrentDay && 'text-ios-blue',
                        !isSelectable && 'text-gray-400'
                      )}
                    >
                      {formatKoreanDate(date, 'd')}
                    </div>
                    {isCurrentDay && (
                      <div className="text-xs text-ios-blue font-medium">오늘</div>
                    )}
                  </div>

                  {/* 사용자 아바타 */}
                  {users.length > 0 && (
                    <div className="flex gap-1 flex-wrap justify-center w-full mt-1">
                      {users.slice(0, 3).map((user) => (
                        <div
                          key={user.userId}
                          className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-semibold"
                          style={{ backgroundColor: user.color }}
                          title={user.name}
                        >
                          {user.name[0]}
                        </div>
                      ))}
                      {users.length > 3 && (
                        <div className="w-6 h-6 rounded-full flex items-center justify-center bg-gray-400 text-white text-xs font-semibold">
                          +{users.length - 3}
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              )
            })}
          </div>
        ))}
      </div>

      {/* 시간 선택 Drawer */}
      {selectedDate && (
        <TimeSlotSelector
          date={selectedDate}
          roomCode={roomCode}
          roomId={roomId}
          isOpen={!!selectedDate}
          onClose={() => {
            setSelectedDate(null)
            loadDateSelections() // 닫힐 때 새로고침
          }}
        />
      )}
    </div>
  )
}
