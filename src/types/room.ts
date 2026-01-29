export interface Room {
  id: string
  code: string
  createdAt: string
  expiresAt: string
  isConfirmed: boolean
  confirmationDate: string | null
  confirmationLocation: string | null
  confirmationMemo: string | null
  password: string | null  // 비밀번호 (해시). null이면 공개 방
  creatorUserId: string | null  // 방장 (방을 만든 사용자 ID)
  isPremium: boolean  // 프리미엄 기능 활성화 (베타 기간에는 모두 true)
  createdBeforePaidLaunch: boolean  // 유료화 전 생성 (평생 무료)
}

export interface RoomUser {
  id: string
  roomId: string
  userId: string
  name: string
  color: string
  joinedAt: string
  lastSeenAt: string
  tags: string[]  // 사용자가 속한 그룹/태그 (예: ["1팀", "보컬"])
}

export interface RoomGroup {
  id: string
  roomId: string
  name: string
  color: string
  createdAt: string
}

export interface TimeSelection {
  id: string
  roomId: string
  userId: string
  date: string
  isAllDay: boolean
  startTime: string | null
  endTime: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateRoomInput {
  code: string
  password?: string  // 선택적 비밀번호
}

export interface JoinRoomInput {
  roomId: string
  userId: string
  name: string
  color: string
}

export interface SelectTimeInput {
  roomId: string
  userId: string
  date: string
  isAllDay?: boolean
  startTime?: string
  endTime?: string
}

export interface Confirmation {
  id: string
  roomId: string
  date: string
  startTime: string | null
  endTime: string | null
  isAllDay: boolean
  participantUserIds: string[]
  participantGroupNames: string[] | null
  location: string | null
  memo: string | null
  confirmedAt: string
}

export interface CreateConfirmationInput {
  roomId: string
  date: string
  startTime?: string
  endTime?: string
  isAllDay?: boolean
  participantUserIds: string[]
  participantGroupNames?: string[]
  location?: string
  memo?: string
}
