export interface TimeSlot {
  start: string // "09:00:00" (database format)
  end: string // "10:00:00" (database format)
  hour: number // 9
  displayStart: string // "09:00" (display format)
  displayEnd: string // "10:00" (display format)
}

/**
 * 시간 슬롯 생성 (1시간 간격)
 */
export function generateTimeSlots(startHour: number = 0, endHour: number = 24): TimeSlot[] {
  const slots: TimeSlot[] = []

  for (let hour = startHour; hour < endHour; hour++) {
    const nextHour = hour === 23 ? 23 : hour + 1
    slots.push({
      start: formatHour(hour),
      end: formatHour(nextHour),
      hour,
      displayStart: formatHourDisplay(hour),
      displayEnd: formatHourDisplay(nextHour),
    })
  }

  return slots
}

/**
 * 시간을 "HH:00:00" 형식으로 포맷 (PostgreSQL TIME 타입용)
 */
export function formatHour(hour: number): string {
  return `${hour.toString().padStart(2, '0')}:00:00`
}

/**
 * 시간을 "HH:00" 형식으로 포맷 (표시용)
 */
export function formatHourDisplay(hour: number): string {
  return `${hour.toString().padStart(2, '0')}:00`
}

/**
 * 시간을 12시간 형식으로 변환
 */
export function formatHour12(hour: number): string {
  const period = hour >= 12 ? 'PM' : 'AM'
  const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
  return `${hour12}${period}`
}

/**
 * "09:00" -> 9
 */
export function parseHourString(timeStr: string): number {
  return parseInt(timeStr.split(':')[0], 10)
}
