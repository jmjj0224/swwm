'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import { supabase } from '@/lib/supabase/client'
import { calculateOverlaps, type OverlapResult, type TimeSelection } from '@/lib/algorithms/overlap-calculator'
import { Calendar, Users, Clock } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface BestTimeSuggestionsProps {
  roomId: string
}

interface DateGroup {
  dateStr: string
  date: Date
  maxUserCount: number
  isFullOverlap: boolean
  score: number
  timeSlots: OverlapResult[]
}

export function BestTimeSuggestions({ roomId }: BestTimeSuggestionsProps) {
  const [overlaps, setOverlaps] = useState<OverlapResult[]>([])
  const [totalUsers, setTotalUsers] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [expandedDate, setExpandedDate] = useState<string | null>(null)

  // 겹치는 시간 계산
  const loadOverlaps = async () => {
    if (!roomId) return

    setIsLoading(true)

    try {
      // 방의 모든 사용자 조회
      const { data: users, error: usersError } = await supabase
        .from('room_users')
        .select('user_id, name, color')
        .eq('room_id', roomId)

      if (usersError) return

      const userMap = new Map(users?.map((u) => [u.user_id, u]) || [])
      setTotalUsers(users?.length || 0)

      // 모든 시간 선택 조회
      const { data: selections, error: selectionsError } = await supabase
        .from('time_selections')
        .select('*')
        .eq('room_id', roomId)

      if (selectionsError) return

      // TimeSelection 형식으로 변환
      const timeSelections: TimeSelection[] =
        selections?.map((s) => {
          const user = userMap.get(s.user_id)
          return {
            userId: s.user_id,
            userName: user?.name || '알 수 없음',
            userColor: user?.color || '#999999',
            date: new Date(s.date),
            isAllDay: s.is_all_day,
            startTime: s.start_time,
            endTime: s.end_time,
          }
        }) || []

      // 겹치는 시간 계산
      const results = calculateOverlaps(timeSelections, users?.length || 0)
      setOverlaps(results)
    } catch (error) {
      // 에러 무시
    } finally {
      setIsLoading(false)
    }
  }

  // 컴포넌트 마운트 시와 Realtime 이벤트 시 로드
  useEffect(() => {
    if (!roomId) return
    loadOverlaps()
  }, [roomId])

  // Drawer 열릴 때 재계산
  useEffect(() => {
    if (isOpen && roomId) {
      loadOverlaps()
    }
  }, [isOpen])

  // Realtime 구독
  useEffect(() => {
    const channel = supabase
      .channel(`room:${roomId}:suggestions`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'time_selections',
          filter: `room_id=eq.${roomId}`,
        },
        () => {
          if (isOpen) {
            loadOverlaps()
          }
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [roomId, isOpen])

  // 날짜별로 그룹화
  const dateGroups = overlaps.reduce<Map<string, DateGroup>>((acc, overlap) => {
    const existing = acc.get(overlap.dateStr)
    if (!existing) {
      acc.set(overlap.dateStr, {
        dateStr: overlap.dateStr,
        date: overlap.date,
        maxUserCount: overlap.userCount,
        isFullOverlap: overlap.isFullOverlap,
        score: overlap.score,
        timeSlots: [overlap],
      })
    } else {
      existing.timeSlots.push(overlap)
      // 최대값 업데이트
      if (overlap.userCount > existing.maxUserCount) {
        existing.maxUserCount = overlap.userCount
        existing.score = overlap.score
      }
      if (overlap.isFullOverlap) {
        existing.isFullOverlap = true
      }
    }
    return acc
  }, new Map())

  // 날짜 그룹을 배열로 변환하고 점수순 정렬
  const sortedDateGroups = Array.from(dateGroups.values()).sort((a, b) => b.score - a.score)
  const topDateGroups = sortedDateGroups.slice(0, 10)

  const fullOverlapCount = overlaps.filter((o) => o.isFullOverlap).length
  const partialOverlapCount = overlaps.filter((o) => !o.isFullOverlap).length

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        <Button
          size="lg"
          className="w-full"
          disabled={isLoading || totalUsers === 0}
          variant={fullOverlapCount > 0 ? 'default' : 'outline'}
        >
          <Calendar className="h-5 w-5 mr-2" />
          {isLoading ? (
            '계산 중...'
          ) : overlaps.length === 0 ? (
            '약속 잡기'
          ) : fullOverlapCount > 0 ? (
            `✅ 약속 잡기 (전원 가능 ${fullOverlapCount}개)`
          ) : (
            `✨ 약속 잡기 (${partialOverlapCount}개 시간대)`
          )}
        </Button>
      </DrawerTrigger>

      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>최적 시간 제안</DrawerTitle>
          <DrawerDescription>
            {totalUsers}명 중 가장 많은 사람이 가능한 시간입니다
          </DrawerDescription>
        </DrawerHeader>

        <div className="px-4 pb-4 space-y-3 max-h-[60vh] overflow-y-auto">
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ios-blue mx-auto mb-2"></div>
              계산 중...
            </div>
          ) : topDateGroups.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>겹치는 시간이 없습니다</p>
              <p className="text-sm">2명 이상이 선택한 시간이 필요합니다</p>
            </div>
          ) : (
            topDateGroups.map((dateGroup, index) => (
              <div
                key={dateGroup.dateStr}
                className={cn(
                  'rounded-lg border-2 transition-all',
                  dateGroup.isFullOverlap
                    ? 'bg-green-50 border-green-400'
                    : dateGroup.maxUserCount >= 2
                    ? 'bg-yellow-50 border-yellow-400'
                    : 'bg-white border-gray-200'
                )}
              >
                {/* 날짜 카드 (클릭 가능) */}
                <button
                  onClick={() => setExpandedDate(expandedDate === dateGroup.dateStr ? null : dateGroup.dateStr)}
                  className="w-full p-4 text-left"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      {/* 순위 뱃지 */}
                      <div className="flex items-center gap-2 mb-2">
                        <div
                          className={cn(
                            'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white',
                            index === 0 ? 'bg-yellow-500' : 'bg-gray-400'
                          )}
                        >
                          {index + 1}
                        </div>
                        {dateGroup.isFullOverlap && (
                          <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                            ✅ 전원 가능!
                          </span>
                        )}
                        {!dateGroup.isFullOverlap && dateGroup.maxUserCount >= 2 && (
                          <span className="text-xs font-semibold text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded-full">
                            ✨ 최대 {dateGroup.maxUserCount}명 가능
                          </span>
                        )}
                      </div>

                      {/* 날짜 */}
                      <div className="mb-2">
                        <div className="font-bold text-lg">
                          {format(dateGroup.date, 'M월 d일 (E)', { locale: ko })}
                        </div>
                        <div className="text-gray-600 text-sm">
                          {dateGroup.timeSlots.length === 1 && dateGroup.timeSlots[0].startTime === '하루 종일'
                            ? '하루 종일 가능'
                            : `${dateGroup.timeSlots.length}개 시간대 겹침`}
                        </div>
                      </div>

                      {/* 참석 가능 인원 */}
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium">
                          최대 {dateGroup.maxUserCount}/{totalUsers}명 가능
                        </span>
                      </div>

                      {/* 사용자 아바타 (최대 참석자 기준) */}
                      <div className="flex flex-wrap gap-1.5">
                        {dateGroup.timeSlots
                          .find((slot) => slot.userCount === dateGroup.maxUserCount)
                          ?.users.map((user) => (
                            <div
                              key={user.id}
                              className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full"
                            >
                              <div
                                className="w-4 h-4 rounded-full"
                                style={{ backgroundColor: user.color }}
                              />
                              <span className="text-xs font-medium">{user.name}</span>
                            </div>
                          ))}
                      </div>
                    </div>

                    {/* 점수 */}
                    <div className="text-right flex-shrink-0">
                      <div className="text-2xl font-bold text-ios-blue">
                        {Math.round(dateGroup.score)}
                      </div>
                      <div className="text-xs text-gray-500">점</div>
                    </div>
                  </div>
                </button>

                {/* 시간대 상세 (펼쳤을 때만 표시) */}
                {expandedDate === dateGroup.dateStr && dateGroup.timeSlots.length > 1 && (
                  <div className="border-t px-4 pb-4 pt-2 space-y-2">
                    <p className="text-xs text-gray-600 mb-2">시간대별 상세:</p>
                    {dateGroup.timeSlots
                      .sort((a, b) => b.userCount - a.userCount || a.hour - b.hour)
                      .map((slot) => (
                        <div
                          key={`${slot.dateStr}-${slot.hour}`}
                          className="p-3 bg-white rounded border"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="font-semibold text-sm">
                              {slot.startTime} ~ {slot.endTime}
                            </div>
                            <div className="text-sm text-gray-600">
                              {slot.userCount}/{totalUsers}명
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {slot.users.map((user) => (
                              <div
                                key={user.id}
                                className="flex items-center gap-1 px-2 py-0.5 bg-gray-50 rounded-full"
                              >
                                <div
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: user.color }}
                                />
                                <span className="text-xs">{user.name}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        <div className="px-4 pb-4">
          <DrawerClose asChild>
            <Button variant="outline" size="lg" className="w-full">
              닫기
            </Button>
          </DrawerClose>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
