import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  addMonths,
  subMonths,
  isSameDay,
  isSameMonth,
  isToday,
  isBefore,
  startOfDay,
} from 'date-fns'
import { ko } from 'date-fns/locale'

export { format, addMonths, subMonths, isSameDay, isSameMonth, isToday }

/**
 * 캘린더 날짜 생성 (과거 날짜도 포함하여 요일 정렬 유지)
 */
export function generateCalendarDates(month: Date): Date[] {
  const start = startOfWeek(startOfMonth(month), { weekStartsOn: 0 }) // 일요일 시작
  const end = endOfWeek(endOfMonth(month), { weekStartsOn: 0 })

  // 모든 날짜 반환 (과거 날짜도 포함)
  return eachDayOfInterval({ start, end })
}

/**
 * 날짜를 주 단위로 그룹화
 */
export function groupDatesByWeek(dates: Date[]): Date[][] {
  const weeks: Date[][] = []
  let currentWeek: Date[] = []

  dates.forEach((date, index) => {
    currentWeek.push(date)

    // 7개씩 또는 마지막 날짜면 주 단위로 저장
    if (currentWeek.length === 7 || index === dates.length - 1) {
      weeks.push([...currentWeek])
      currentWeek = []
    }
  })

  return weeks
}

/**
 * 한국어 날짜 포맷
 */
export function formatKoreanDate(date: Date, formatStr: string): string {
  return format(date, formatStr, { locale: ko })
}

/**
 * 날짜가 선택 가능한지 확인 (과거 날짜는 선택 불가)
 */
export function isDateSelectable(date: Date): boolean {
  const today = startOfDay(new Date())
  return !isBefore(startOfDay(date), today)
}
