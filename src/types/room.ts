export interface Room {
  id: string
  code: string
  createdAt: string
  expiresAt: string
  isConfirmed: boolean
  confirmationDate: string | null
  confirmationLocation: string | null
  confirmationMemo: string | null
}

export interface RoomUser {
  id: string
  roomId: string
  userId: string
  name: string
  color: string
  joinedAt: string
  lastSeenAt: string
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
