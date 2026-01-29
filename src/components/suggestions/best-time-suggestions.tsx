'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { supabase } from '@/lib/supabase/client'
import { calculateOverlaps, type OverlapResult, type TimeSelection } from '@/lib/algorithms/overlap-calculator'
import { Calendar, Users, Clock, MapPin, CheckCircle2, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { RoomGroup, Confirmation } from '@/types/room'
import { locationSchema, memoSchema, validateInput } from '@/lib/validation/schemas'

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
  const [allUsers, setAllUsers] = useState<any[]>([])
  const [groups, setGroups] = useState<RoomGroup[]>([])
  const [confirmations, setConfirmations] = useState<Confirmation[]>([])
  const [selectedGroupFilter, setSelectedGroupFilter] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [expandedDate, setExpandedDate] = useState<string | null>(null)

  // 확정 다이얼로그 상태
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [confirmingSlot, setConfirmingSlot] = useState<OverlapResult | null>(null)
  const [confirmLocation, setConfirmLocation] = useState('')
  const [confirmMemo, setConfirmMemo] = useState('')
  const [isConfirming, setIsConfirming] = useState(false)

  // 그룹과 확정된 약속 로드
  useEffect(() => {
    if (!roomId) return
    loadGroups()
    loadConfirmations()
    loadInitialUserCount()
  }, [roomId])

  // 초기 사용자 수 로드 (버튼 활성화용)
  const loadInitialUserCount = async () => {
    const { data: users } = await supabase
      .from('room_users')
      .select('user_id')
      .eq('room_id', roomId)

    if (users) {
      setTotalUsers(users.length)
    }
  }

  const loadGroups = async () => {
    const { data } = await supabase
      .from('room_groups')
      .select('*')
      .eq('room_id', roomId)
      .order('created_at', { ascending: true })

    if (data) {
      setGroups(data)
    }
  }

  const loadConfirmations = async () => {
    const { data } = await supabase
      .from('confirmations')
      .select('*')
      .eq('room_id', roomId)
      .order('date', { ascending: true })

    if (data) {
      setConfirmations(data.map(c => ({
        id: c.id,
        roomId: c.room_id,
        date: c.date,
        startTime: c.start_time,
        endTime: c.end_time,
        isAllDay: c.is_all_day,
        participantUserIds: c.participant_user_ids,
        participantGroupNames: c.participant_group_names,
        location: c.location,
        memo: c.memo,
        confirmedAt: c.confirmed_at,
      })))
    }
  }

  // 사용자가 확정된 약속에 참여 중인지 확인
  const isUserConfirmedAt = (userId: string, date: Date, hour: number): boolean => {
    const dateStr = format(date, 'yyyy-MM-dd')
    return confirmations.some(conf => {
      if (conf.date !== dateStr) return false
      if (!conf.participantUserIds.includes(userId)) return false

      // 하루 종일 확정이면 무조건 제외
      if (conf.isAllDay) return true

      // 시간대 확인
      if (conf.startTime && conf.endTime) {
        const confStart = parseInt(conf.startTime.split(':')[0])
        const confEnd = parseInt(conf.endTime.split(':')[0])
        return hour >= confStart && hour < confEnd
      }

      return false
    })
  }

  // 겹치는 시간 계산
  const loadOverlaps = async () => {
    if (!roomId) return

    setIsLoading(true)

    try {
      // 방의 모든 사용자 조회
      const { data: users, error: usersError } = await supabase
        .from('room_users')
        .select('user_id, name, color, tags')
        .eq('room_id', roomId)

      if (usersError) return

      setAllUsers(users || [])

      // 그룹 필터 적용
      let filteredUsers = users || []
      if (selectedGroupFilter) {
        filteredUsers = users?.filter(u =>
          u.tags && Array.isArray(u.tags) && u.tags.includes(selectedGroupFilter)
        ) || []
      }

      const userMap = new Map(filteredUsers.map((u) => [u.user_id, u]))
      setTotalUsers(filteredUsers.length)

      // 필터링된 사용자들의 시간 선택만 조회
      const userIds = filteredUsers.map(u => u.user_id)

      const { data: selections, error: selectionsError } = await supabase
        .from('time_selections')
        .select('*')
        .eq('room_id', roomId)
        .in('user_id', userIds)

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
      let results = calculateOverlaps(timeSelections, filteredUsers.length)

      // 확정된 약속에 참여 중인 사용자 제외
      results = results.map(overlap => {
        const availableUsers = overlap.users.filter(user =>
          !isUserConfirmedAt(user.id, overlap.date, overlap.hour)
        )

        return {
          ...overlap,
          users: availableUsers,
          userCount: availableUsers.length,
          isFullOverlap: availableUsers.length === filteredUsers.length,
        }
      }).filter(overlap => overlap.userCount >= 2) // 2명 이상만 표시

      setOverlaps(results)
    } catch (error) {
      // 에러 무시
    } finally {
      setIsLoading(false)
    }
  }

  // Drawer 열릴 때 재계산
  useEffect(() => {
    if (isOpen && roomId) {
      loadOverlaps()
    }
  }, [isOpen, selectedGroupFilter])

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
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'confirmations',
          filter: `room_id=eq.${roomId}`,
        },
        () => {
          loadConfirmations()
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

  // 약속 확정 처리
  const handleConfirm = async () => {
    if (!confirmingSlot) return

    // 입력 검증
    if (confirmLocation.trim()) {
      const locationValidation = validateInput(locationSchema, confirmLocation.trim())
      if (!locationValidation.success) {
        alert(locationValidation.error)
        return
      }
    }

    if (confirmMemo.trim()) {
      const memoValidation = validateInput(memoSchema, confirmMemo.trim())
      if (!memoValidation.success) {
        alert(memoValidation.error)
        return
      }
    }

    setIsConfirming(true)

    try {
      const { error } = await supabase
        .from('confirmations')
        .insert({
          room_id: roomId,
          date: format(confirmingSlot.date, 'yyyy-MM-dd'),
          start_time: confirmingSlot.startTime === '하루 종일' ? null : confirmingSlot.startTime,
          end_time: confirmingSlot.startTime === '하루 종일' ? null : confirmingSlot.endTime,
          is_all_day: confirmingSlot.startTime === '하루 종일',
          participant_user_ids: confirmingSlot.users.map(u => u.id),
          participant_group_names: selectedGroupFilter ? [selectedGroupFilter] : null,
          location: confirmLocation.trim() || null,
          memo: confirmMemo.trim() || null,
        })

      if (error) throw error

      alert('✅ 약속이 확정되었습니다!')
      setShowConfirmDialog(false)
      setConfirmingSlot(null)
      setConfirmLocation('')
      setConfirmMemo('')

      // 재로드
      await loadConfirmations()
      await loadOverlaps()
    } catch (error: any) {
      alert(`약속 확정에 실패했습니다\n\n${error.message}`)
    } finally {
      setIsConfirming(false)
    }
  }

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

  const sortedDateGroups = Array.from(dateGroups.values()).sort((a, b) => b.score - a.score)
  const topDateGroups = sortedDateGroups.slice(0, 10)

  const fullOverlapCount = overlaps.filter((o) => o.isFullOverlap).length
  const partialOverlapCount = overlaps.filter((o) => !o.isFullOverlap).length

  return (
    <>
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
              {selectedGroupFilter
                ? `"${selectedGroupFilter}" 그룹 멤버 중 가능한 시간`
                : `${totalUsers}명 중 가장 많은 사람이 가능한 시간`}
            </DrawerDescription>
          </DrawerHeader>

          <div className="px-4 pb-4 space-y-4 max-h-[70vh] overflow-y-auto">
            {/* 그룹 필터 */}
            {groups.length > 0 && (
              <div className="space-y-2 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-purple-600" />
                  <Label className="text-sm font-semibold text-purple-900">
                    그룹 필터
                  </Label>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-200 text-purple-700 rounded-full text-xs font-semibold">
                    <Sparkles className="h-3 w-3" />
                    프리미엄
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      setSelectedGroupFilter(null)
                      loadOverlaps()
                    }}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-sm font-medium transition border',
                      !selectedGroupFilter
                        ? 'bg-purple-600 text-white border-purple-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    )}
                  >
                    전체
                  </button>
                  {groups.map((group) => (
                    <button
                      key={group.id}
                      onClick={() => {
                        setSelectedGroupFilter(group.name)
                        loadOverlaps()
                      }}
                      className={cn(
                        'inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition border',
                        selectedGroupFilter === group.name
                          ? 'bg-white border-2 shadow-sm'
                          : 'bg-white border border-gray-200 hover:bg-gray-50'
                      )}
                      style={{
                        borderColor: selectedGroupFilter === group.name ? group.color : undefined,
                      }}
                    >
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: group.color }}
                      />
                      <span>{group.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 결과 */}
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
                  <button
                    onClick={() => setExpandedDate(expandedDate === dateGroup.dateStr ? null : dateGroup.dateStr)}
                    className="w-full p-4 text-left"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
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
                        </div>

                        <div className="mb-2">
                          <div className="font-bold text-lg">
                            {format(dateGroup.date, 'M월 d일 (E)', { locale: ko })}
                          </div>
                          <div className="text-gray-600 text-sm">
                            {dateGroup.timeSlots.length === 1 && dateGroup.timeSlots[0].startTime === '하루 종일'
                              ? '하루 종일 가능'
                              : `${dateGroup.timeSlots.length}개 시간대`}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mb-2">
                          <Users className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-medium">
                            최대 {dateGroup.maxUserCount}/{totalUsers}명 가능
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-1.5">
                          {dateGroup.timeSlots
                            .find((slot) => slot.userCount === dateGroup.maxUserCount)
                            ?.users.slice(0, 5).map((user) => (
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
                          {(dateGroup.timeSlots.find((slot) => slot.userCount === dateGroup.maxUserCount)?.users.length || 0) > 5 && (
                            <span className="text-xs text-gray-500 px-2 py-1">
                              +{(dateGroup.timeSlots.find((slot) => slot.userCount === dateGroup.maxUserCount)?.users.length || 0) - 5}명
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <div className="text-2xl font-bold text-ios-blue">
                          {Math.round(dateGroup.score)}
                        </div>
                        <div className="text-xs text-gray-500">점</div>
                      </div>
                    </div>
                  </button>

                  {expandedDate === dateGroup.dateStr && dateGroup.timeSlots.length > 1 && (
                    <div className="border-t px-4 pb-4 pt-2 space-y-2">
                      <p className="text-xs text-gray-600 mb-2">시간대별 상세:</p>
                      {dateGroup.timeSlots
                        .sort((a, b) => b.userCount - a.userCount || a.hour - b.hour)
                        .map((slot) => (
                          <div
                            key={`${slot.dateStr}-${slot.hour}`}
                            className="p-3 bg-white rounded border space-y-2"
                          >
                            <div className="flex items-center justify-between">
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
                            <Button
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                setConfirmingSlot(slot)
                                setShowConfirmDialog(true)
                              }}
                              className="w-full mt-2"
                            >
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              이 시간으로 확정하기
                            </Button>
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

      {/* 확정 다이얼로그 */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>약속 확정</DialogTitle>
            <DialogDescription>
              선택한 시간으로 약속을 확정하시겠습니까?
            </DialogDescription>
          </DialogHeader>

          {confirmingSlot && (
            <div className="space-y-4">
              {/* 확정 정보 */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-2">
                <div className="font-semibold text-lg">
                  {format(confirmingSlot.date, 'M월 d일 (E)', { locale: ko })}
                </div>
                <div className="text-sm text-gray-700">
                  {confirmingSlot.startTime} ~ {confirmingSlot.endTime}
                </div>
                <div className="text-sm text-gray-600">
                  참여 인원: {confirmingSlot.userCount}명
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {confirmingSlot.users.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center gap-1 px-2 py-1 bg-white rounded-full text-xs"
                    >
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: user.color }}
                      />
                      <span>{user.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 장소 입력 */}
              <div className="space-y-2">
                <Label htmlFor="location" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  장소 (선택사항)
                </Label>
                <Input
                  id="location"
                  placeholder="예: 강남역 스타벅스"
                  value={confirmLocation}
                  onChange={(e) => setConfirmLocation(e.target.value)}
                  maxLength={100}
                />
              </div>

              {/* 메모 입력 */}
              <div className="space-y-2">
                <Label htmlFor="memo">메모 (선택사항)</Label>
                <Textarea
                  id="memo"
                  placeholder="추가 메모나 준비물 등"
                  value={confirmMemo}
                  onChange={(e) => setConfirmMemo(e.target.value)}
                  maxLength={500}
                  rows={3}
                />
              </div>

              {/* 안내 */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-xs text-yellow-800 leading-relaxed">
                  ⚠️ 확정 후 참여자들은 이 시간대에 다른 약속을 잡을 수 없습니다.
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowConfirmDialog(false)
                setConfirmingSlot(null)
              }}
              disabled={isConfirming}
            >
              취소
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={isConfirming}
            >
              {isConfirming ? '확정 중...' : '확정하기'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
