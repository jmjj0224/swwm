import { format, parseISO } from 'date-fns'

export interface TimeSelection {
  userId: string
  userName: string
  userColor: string
  date: Date
  isAllDay: boolean
  startTime?: string // "09:00:00"
  endTime?: string // "10:00:00"
}

export interface OverlapResult {
  date: Date
  dateStr: string
  hour: number
  startTime: string
  endTime: string
  userIds: string[]
  users: Array<{ id: string; name: string; color: string }>
  userCount: number
  isFullOverlap: boolean // 모든 사용자가 선택
  score: number // 0-100
}

/**
 * 겹치는 시간대 계산
 */
export function calculateOverlaps(
  selections: TimeSelection[],
  totalUsers: number
): OverlapResult[] {
  if (selections.length === 0 || totalUsers === 0) {
    return []
  }

  // 1. 날짜별로 그룹화
  const byDate = new Map<string, TimeSelection[]>()

  for (const selection of selections) {
    const dateStr = format(selection.date, 'yyyy-MM-dd')
    if (!byDate.has(dateStr)) {
      byDate.set(dateStr, [])
    }
    byDate.get(dateStr)!.push(selection)
  }

  const overlaps: OverlapResult[] = []

  // 2. 각 날짜마다 시간 슬롯 계산
  for (const [dateStr, dateSelections] of byDate.entries()) {
    const date = parseISO(dateStr)

    // 전체 날짜 선택한 사용자들
    const allDayUsers = dateSelections.filter((s) => s.isAllDay)
    const allDayUserMap = new Map(
      allDayUsers.map((s) => [s.userId, { id: s.userId, name: s.userName, color: s.userColor }])
    )

    // 시간별 선택
    const timeSlots = dateSelections.filter((s) => !s.isAllDay)

    // 시간 슬롯을 1시간 단위로 분해
    // Map<hour, Set<userId>>
    const slotMap = new Map<number, Map<string, { name: string; color: string }>>()

    for (const selection of timeSlots) {
      if (!selection.startTime || !selection.endTime) continue

      const startHour = parseInt(selection.startTime.split(':')[0])
      const endHour = parseInt(selection.endTime.split(':')[0])

      // 시작 시간부터 종료 시간 전까지 모든 시간대에 사용자 추가
      // 예: 14:00-16:00 → hour 14, 15 포함
      for (let hour = startHour; hour < endHour; hour++) {
        if (!slotMap.has(hour)) {
          slotMap.set(hour, new Map())
        }

        slotMap.get(hour)!.set(selection.userId, {
          name: selection.userName,
          color: selection.userColor,
        })
      }
    }

    // 3-1. 만약 "하루 종일"만 선택한 경우 (시간 슬롯이 없는 경우)
    if (slotMap.size === 0 && allDayUsers.length >= 2) {
      // 하루 종일 선택한 사람들만으로 겹침 생성 (대표 시간대: 0시)
      const userCount = allDayUsers.length
      const users = Array.from(allDayUserMap.values())
      const isFullOverlap = userCount === totalUsers
      const score = (userCount / totalUsers) * 100 + (isFullOverlap ? 10 : 0)

      overlaps.push({
        date,
        dateStr,
        hour: 0, // 대표 시간
        startTime: '하루 종일',
        endTime: '하루 종일',
        userIds: allDayUsers.map(s => s.userId),
        users: users.map(u => ({ id: u.id, name: u.name, color: u.color })),
        userCount,
        isFullOverlap,
        score: Math.min(100, score),
      })
    }

    // 3-2. 겹치는 시간대 찾기 (시간별 선택이 있는 경우)
    for (const [hour, userMap] of slotMap.entries()) {
      // 전체 날짜 선택 사용자 추가
      for (const [userId, user] of allDayUserMap.entries()) {
        if (!userMap.has(userId)) {
          userMap.set(userId, user)
        }
      }

      const userCount = userMap.size

      // 2명 이상 겹치면 추가
      if (userCount >= 2) {
        const users = Array.from(userMap.entries()).map(([id, info]) => ({
          id,
          name: info.name,
          color: info.color,
        }))

        const isFullOverlap = userCount === totalUsers
        const score = (userCount / totalUsers) * 100 + (isFullOverlap ? 10 : 0)

        overlaps.push({
          date,
          dateStr,
          hour,
          startTime: formatHour(hour),
          endTime: formatHour(hour + 1),
          userIds: Array.from(userMap.keys()),
          users,
          userCount,
          isFullOverlap,
          score: Math.min(100, score),
        })
      }
    }
  }

  // 점수순으로 정렬
  return overlaps.sort((a, b) => b.score - a.score)
}

/**
 * 시간을 "HH:00" 형식으로 포맷 (표시용)
 */
function formatHour(hour: number): string {
  return `${hour.toString().padStart(2, '0')}:00`
}

/**
 * 특정 날짜/시간의 겹침 정보 가져오기
 */
export function getOverlapForSlot(
  overlaps: OverlapResult[],
  dateStr: string,
  hour: number
): OverlapResult | undefined {
  return overlaps.find((o) => o.dateStr === dateStr && o.hour === hour)
}
