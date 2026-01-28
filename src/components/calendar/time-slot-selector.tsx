'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { cn } from '@/lib/utils/cn'
import { formatKoreanDate } from '@/lib/calendar/date-utils'
import { generateTimeSlots, formatHour12, type TimeSlot } from '@/lib/calendar/time-slots'
import { supabase } from '@/lib/supabase/client'
import { useUserStore } from '@/lib/stores/user-store'
import { calculateOverlaps, type TimeSelection } from '@/lib/algorithms/overlap-calculator'
import { format } from 'date-fns'
import { Clock, MousePointerClick, Sparkles } from 'lucide-react'

interface TimeSlotSelectorProps {
  date: Date
  roomCode: string
  roomId: string
  isOpen: boolean
  onClose: () => void
}

type SelectionMode = 'individual' | 'range'

interface OtherUserSelection {
  userId: string
  name: string
  color: string
  slots: TimeSlot[]
  isAllDay: boolean
}

export function TimeSlotSelector({ date, roomCode, roomId, isOpen, onClose }: TimeSlotSelectorProps) {
  const getCurrentUser = useUserStore((state) => state.getCurrentUser)
  const currentUser = getCurrentUser(roomCode.toUpperCase())
  const [selectedSlots, setSelectedSlots] = useState<TimeSlot[]>([])
  const [isAllDay, setIsAllDay] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [selectionMode, setSelectionMode] = useState<SelectionMode>('individual')
  const [rangeStart, setRangeStart] = useState<TimeSlot | null>(null)
  const [otherUsers, setOtherUsers] = useState<OtherUserSelection[]>([])
  const [totalUsers, setTotalUsers] = useState(0)
  const [overlapHours, setOverlapHours] = useState<Map<number, { count: number; isFullOverlap: boolean }>>(new Map())

  const timeSlots = generateTimeSlots(0, 24) // 0:00 - 23:00

  // 기존 선택 불러오기 (내 선택 + 다른 사용자 선택)
  useEffect(() => {
    if (!isOpen || !currentUser) return

    const loadSelections = async () => {
      const dateStr = format(date, 'yyyy-MM-dd')
      console.log('🔍 모든 선택 불러오기:', { dateStr, roomId })

      // 모든 사용자의 선택 불러오기
      const { data: allSelections, error: selectionsError } = await supabase
        .from('time_selections')
        .select('*')
        .eq('room_id', roomId)
        .eq('date', dateStr)

      if (selectionsError) {
        console.error('❌ 선택 불러오기 실패:', selectionsError)
        return
      }

      // 방의 모든 사용자 정보 불러오기
      const { data: users, error: usersError } = await supabase
        .from('room_users')
        .select('user_id, name, color')
        .eq('room_id', roomId)

      if (usersError) {
        console.error('❌ 사용자 정보 불러오기 실패:', usersError)
        return
      }

      const totalUserCount = users?.length || 0
      setTotalUsers(totalUserCount)

      console.log('✅ 불러온 선택:', allSelections?.length, '개')
      console.log('👥 방 사용자:', totalUserCount, '명')

      // 내 선택 처리
      const mySelections = allSelections?.filter(s => s.user_id === currentUser.id) || []
      if (mySelections.length > 0) {
        const firstSelection = mySelections[0]

        if (firstSelection.is_all_day) {
          setIsAllDay(true)
          setSelectedSlots([])
          console.log('📅 내 선택: 하루 종일')
        } else {
          setIsAllDay(false)
          const slots = mySelections
            .filter(s => s.start_time)
            .map(s => {
              const hour = parseInt(s.start_time.split(':')[0])
              return timeSlots.find(slot => slot.hour === hour)!
            })
            .filter(Boolean)

          setSelectedSlots(slots)
          console.log('⏰ 내 선택:', slots.length, '개')
        }
      } else {
        console.log('📭 내 선택 없음')
        setIsAllDay(false)
        setSelectedSlots([])
      }

      // 다른 사용자들의 선택 처리
      const otherUsersData: OtherUserSelection[] = []
      const otherUserIds = Array.from(new Set(
        allSelections?.filter(s => s.user_id !== currentUser.id).map(s => s.user_id) || []
      ))

      for (const userId of otherUserIds) {
        const user = users?.find(u => u.user_id === userId)
        if (!user) continue

        const userSelections = allSelections?.filter(s => s.user_id === userId) || []
        const isAllDay = userSelections.some(s => s.is_all_day)

        const slots = userSelections
          .filter(s => s.start_time && !s.is_all_day)
          .map(s => {
            const hour = parseInt(s.start_time.split(':')[0])
            return timeSlots.find(slot => slot.hour === hour)!
          })
          .filter(Boolean)

        otherUsersData.push({
          userId: user.user_id,
          name: user.name,
          color: user.color,
          slots,
          isAllDay
        })
      }

      setOtherUsers(otherUsersData)
      console.log('👥 다른 사용자 선택:', otherUsersData.length, '명')

      // 겹치는 시간 계산 (전원 가능한 시간 찾기)
      if (totalUserCount > 0) {
        const timeSelections: TimeSelection[] =
          allSelections?.map((s) => {
            const user = users?.find((u) => u.user_id === s.user_id)
            return {
              userId: s.user_id,
              userName: user?.name || '알 수 없음',
              userColor: user?.color || '#999999',
              date,
              isAllDay: s.is_all_day,
              startTime: s.start_time,
              endTime: s.end_time,
            }
          }) || []

        const overlaps = calculateOverlaps(timeSelections, totalUserCount)
        const overlapMap = new Map<number, { count: number; isFullOverlap: boolean }>()

        overlaps.forEach((o) => {
          overlapMap.set(o.hour, {
            count: o.userCount,
            isFullOverlap: o.isFullOverlap,
          })
        })

        setOverlapHours(overlapMap)
        console.log('✨ 겹치는 시간:', Array.from(overlapMap.entries()).map(([h, v]) => `${h}시: ${v.count}명`))
      }
    }

    loadSelections()

    // Realtime 구독
    const channel = supabase
      .channel(`room:${roomId}:time_slots:${format(date, 'yyyy-MM-dd')}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'time_selections',
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          console.log('🔔 실시간 변경 감지:', payload)
          loadSelections()
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [isOpen, currentUser, date, roomId])

  const saveSelections = async (slots: TimeSlot[], allDay: boolean) => {
    if (!currentUser) {
      console.error('❌ 사용자 정보 없음')
      return false
    }

    setIsSaving(true)
    console.log('💾 저장 시작:', { slots: slots.length, allDay })

    try {
      const dateStr = format(date, 'yyyy-MM-dd')

      console.log('🗑️ 기존 선택 삭제 시도...')
      // 기존 선택 삭제
      const { error: deleteError } = await supabase
        .from('time_selections')
        .delete()
        .eq('room_id', roomId)
        .eq('user_id', currentUser.id)
        .eq('date', dateStr)

      if (deleteError) {
        console.error('❌ 기존 선택 삭제 실패:', deleteError)
        throw deleteError
      }

      console.log('✅ 기존 선택 삭제 완료')

      // 새로 선택한 내용이 없으면 삭제만 하고 종료
      if (!allDay && slots.length === 0) {
        console.log('✅ 선택 해제 완료 (저장할 내용 없음)')
        setIsSaving(false)
        return true
      }

      if (allDay) {
        console.log('💾 하루 종일 저장 중...')
        const allDayData = {
          room_id: roomId,
          user_id: currentUser.id,
          date: dateStr,
          is_all_day: true,
          start_time: null,
          end_time: null,
        }
        console.log('📤 저장할 데이터 (하루 종일):', allDayData)

        // 하루 종일 선택
        const { data, error } = await supabase
          .from('time_selections')
          .insert(allDayData)
          .select()

        if (error) {
          console.error('❌ 하루 종일 저장 실패:', error)
          console.error('📋 에러 상세:', JSON.stringify(error, null, 2))
          throw error
        }

        console.log('✅ 하루 종일 저장 성공!', data)
      } else {
        console.log('💾 시간 슬롯 저장 중...', slots.length, '개')
        // 개별 시간 슬롯 선택
        const inserts = slots.map((slot) => ({
          room_id: roomId,
          user_id: currentUser.id,
          date: dateStr,
          is_all_day: false,
          start_time: slot.start,
          end_time: slot.end,
        }))

        console.log('📤 저장할 데이터:', inserts)
        console.log('📋 첫 번째 슬롯 상세:', JSON.stringify(inserts[0], null, 2))

        const { data, error } = await supabase
          .from('time_selections')
          .insert(inserts)
          .select()

        if (error) {
          console.error('❌ 시간 슬롯 저장 실패:', error)
          console.error('📋 에러 상세:', JSON.stringify(error, null, 2))
          throw error
        }

        console.log('✅ 시간 슬롯 저장 성공!', data)
      }

      setIsSaving(false)
      return true
    } catch (error: any) {
      console.error('❌ 저장 실패:', error)
      alert(`저장에 실패했습니다.\n\n${error.message}`)
      setIsSaving(false)
      return false
    }
  }

  const handleSlotToggle = async (slot: TimeSlot) => {
    setIsAllDay(false)

    if (selectionMode === 'individual') {
      // 개별 선택 모드
      const newSlots = selectedSlots.some((s) => s.hour === slot.hour)
        ? selectedSlots.filter((s) => s.hour !== slot.hour)
        : [...selectedSlots, slot].sort((a, b) => a.hour - b.hour)

      setSelectedSlots(newSlots)

      // 즉시 저장
      console.log('🔄 개별 선택 변경 - 즉시 저장')
      await saveSelections(newSlots, false)
    } else {
      // 범위 선택 모드
      if (!rangeStart) {
        // 첫 번째 클릭 - 시작점 설정
        setRangeStart(slot)
        setSelectedSlots([slot])
        console.log('📍 범위 시작점 설정:', slot.hour)
      } else {
        // 두 번째 클릭 - 범위 선택
        const start = Math.min(rangeStart.hour, slot.hour)
        const end = Math.max(rangeStart.hour, slot.hour)

        const rangeSlots = timeSlots.filter(
          (s) => s.hour >= start && s.hour <= end
        )

        setSelectedSlots(rangeSlots)
        setRangeStart(null)

        // 즉시 저장
        console.log('🔄 범위 선택 완료 - 즉시 저장')
        await saveSelections(rangeSlots, false)

        // 범위 선택 후 자동으로 개별 선택 모드로 전환
        setSelectionMode('individual')
      }
    }
  }

  const handleAllDayToggle = async () => {
    const newAllDay = !isAllDay
    setIsAllDay(newAllDay)

    if (newAllDay) {
      setSelectedSlots([])
      setRangeStart(null)
      console.log('🔄 하루 종일 선택 - 즉시 저장')
      await saveSelections([], true)
    } else {
      console.log('🔄 하루 종일 해제 - 즉시 저장')
      await saveSelections([], false)
    }
  }

  const handleModeToggle = () => {
    const newMode = selectionMode === 'individual' ? 'range' : 'individual'
    setSelectionMode(newMode)
    setRangeStart(null)
    console.log('🔀 선택 모드 변경:', newMode)
  }

  const handleClose = () => {
    console.log('🚪 Drawer 닫기')
    onClose()
  }

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{formatKoreanDate(date, 'M월 d일 (E)')}</DrawerTitle>
          <DrawerDescription>
            가능한 시간을 선택해주세요 {isSaving && '· 💾 저장 중...'}
          </DrawerDescription>
        </DrawerHeader>

        <div className="px-4 pb-4 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* 모드 선택 버튼들 */}
          <div className="flex gap-2">
            <Button
              variant={isAllDay ? 'default' : 'outline'}
              className="flex-1"
              onClick={handleAllDayToggle}
              disabled={isSaving}
            >
              <Clock className="h-4 w-4 mr-2" />
              하루 종일
            </Button>

            <Button
              variant={selectionMode === 'range' ? 'default' : 'outline'}
              className="flex-1"
              onClick={handleModeToggle}
              disabled={isSaving}
            >
              <MousePointerClick className="h-4 w-4 mr-2" />
              범위 선택
              {selectionMode === 'range' && rangeStart && ' (시작점 설정됨)'}
            </Button>
          </div>

          {/* 시간 슬롯 그리드 */}
          <div className="grid grid-cols-4 gap-2">
            {timeSlots.map((slot) => {
              const isSelected = selectedSlots.some((s) => s.hour === slot.hour)
              const isRangeStart = rangeStart?.hour === slot.hour
              const overlap = overlapHours.get(slot.hour)
              const hasOverlap = overlap && overlap.count >= 2
              const isFullOverlap = overlap?.isFullOverlap || false

              // 이 시간대를 선택한 다른 사용자들
              const usersForSlot = otherUsers.filter(u =>
                u.isAllDay || u.slots.some(s => s.hour === slot.hour)
              )

              return (
                <div key={slot.hour} className="relative">
                  <Button
                    variant={isSelected ? 'default' : 'outline'}
                    className={cn(
                      'h-auto py-3 w-full relative',
                      isSelected && !hasOverlap && 'bg-ios-blue text-white',
                      isRangeStart && 'ring-2 ring-ios-yellow',
                      // 2명 이상 겹침 = 노란색
                      hasOverlap && !isFullOverlap && !isSelected && 'bg-yellow-100 border-yellow-400 hover:bg-yellow-200',
                      hasOverlap && !isFullOverlap && isSelected && 'bg-yellow-500 hover:bg-yellow-600 text-white',
                      // 전원 겹침 = 빨간색
                      isFullOverlap && !isSelected && 'bg-red-100 border-red-400 hover:bg-red-200',
                      isFullOverlap && isSelected && 'bg-red-500 hover:bg-red-600 text-white',
                      selectionMode === 'range' && 'cursor-crosshair'
                    )}
                    onClick={() => handleSlotToggle(slot)}
                    disabled={isAllDay || isSaving}
                  >
                    <div className="text-center w-full">
                      <div className="flex items-center justify-center gap-1">
                        <div className="text-sm font-semibold">
                          {formatHour12(slot.hour)}
                        </div>
                        {hasOverlap && (
                          <Sparkles className={cn(
                            "h-3 w-3",
                            isFullOverlap ? "text-red-600" : "text-yellow-600"
                          )} />
                        )}
                      </div>
                      <div className="text-xs opacity-80">
                        {slot.displayStart}
                        {hasOverlap && (
                          <span className="ml-1 font-semibold">
                            ({overlap!.count}명)
                          </span>
                        )}
                      </div>
                    </div>
                  </Button>

                  {/* 다른 사용자 아바타 표시 */}
                  {usersForSlot.length > 0 && (
                    <div className="absolute -bottom-1 -right-1 flex gap-0.5">
                      {usersForSlot.slice(0, 2).map((user) => (
                        <div
                          key={user.userId}
                          className="w-4 h-4 rounded-full flex items-center justify-center text-white text-[8px] font-semibold border border-white"
                          style={{ backgroundColor: user.color }}
                          title={user.name}
                        >
                          {user.name[0]}
                        </div>
                      ))}
                      {usersForSlot.length > 2 && (
                        <div className="w-4 h-4 rounded-full flex items-center justify-center bg-gray-400 text-white text-[8px] font-semibold border border-white">
                          +{usersForSlot.length - 2}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* 범위 선택 안내 */}
          {selectionMode === 'range' && (
            <div className="text-sm text-gray-600 text-center bg-ios-gray rounded-lg p-3">
              {rangeStart
                ? '종료 시간을 클릭하세요'
                : '시작 시간을 클릭하세요'}
            </div>
          )}

          {/* 다른 사용자 목록 */}
          {otherUsers.length > 0 && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <div className="text-xs font-semibold text-gray-600 mb-2">
                이 날짜를 선택한 사람들
              </div>
              <div className="flex flex-wrap gap-2">
                {otherUsers.map((user) => (
                  <div
                    key={user.userId}
                    className="flex items-center gap-1.5 px-2 py-1 bg-white rounded-full border"
                  >
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-semibold"
                      style={{ backgroundColor: user.color }}
                    >
                      {user.name[0]}
                    </div>
                    <span className="text-xs font-medium">{user.name}</span>
                    <span className="text-xs text-gray-500">
                      {user.isAllDay ? '하루종일' : `${user.slots.length}시간`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="px-4 pb-4">
          <Button
            variant="outline"
            size="lg"
            className="w-full"
            onClick={handleClose}
          >
            닫기
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
