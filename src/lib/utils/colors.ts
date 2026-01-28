/**
 * 20가지 색상 팔레트
 * 각 사용자가 선택할 수 있는 고유 색상
 */
export const USER_COLORS = [
  { name: '빨강', value: '#FF3B30', light: '#FFEBEB' },
  { name: '주황', value: '#FF9500', light: '#FFF3E6' },
  { name: '노랑', value: '#FFCC00', light: '#FFF9E6' },
  { name: '초록', value: '#34C759', light: '#EAFAEF' },
  { name: '청록', value: '#5AC8FA', light: '#EBF8FF' },
  { name: '파랑', value: '#007AFF', light: '#E6F2FF' },
  { name: '인디고', value: '#5856D6', light: '#EEEBFF' },
  { name: '보라', value: '#AF52DE', light: '#F7EDFF' },
  { name: '핑크', value: '#FF2D55', light: '#FFEBF0' },
  { name: '자주', value: '#C7007F', light: '#FFE6F5' },
  { name: '갈색', value: '#A2845E', light: '#F5F0EB' },
  { name: '회색', value: '#8E8E93', light: '#F2F2F7' },
  { name: '코랄', value: '#FF6B6B', light: '#FFEEEE' },
  { name: '민트', value: '#00D9B9', light: '#E6FFF9' },
  { name: '라벤더', value: '#B794F4', light: '#F4EDFF' },
  { name: '피치', value: '#FFB088', light: '#FFF3EB' },
  { name: '올리브', value: '#9CAF88', light: '#F3F5F0' },
  { name: '스카이', value: '#87CEEB', light: '#EDF7FF' },
  { name: '로즈', value: '#E06C9F', light: '#FFEEF5' },
  { name: '머스타드', value: '#E1BE6A', light: '#FFF8EB' },
] as const

export type UserColor = (typeof USER_COLORS)[number]

export function getRandomColor(): UserColor {
  const randomIndex = Math.floor(Math.random() * USER_COLORS.length)
  return USER_COLORS[randomIndex]
}

export function getColorByIndex(index: number): UserColor {
  return USER_COLORS[index % USER_COLORS.length]
}

export function getColorByValue(value: string): UserColor | undefined {
  return USER_COLORS.find((color) => color.value === value)
}
