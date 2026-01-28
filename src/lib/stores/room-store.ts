import { create } from 'zustand'
import type { Room } from '@/types/room'

interface RoomState {
  currentRoom: Room | null
  isLoading: boolean
  error: string | null

  setCurrentRoom: (room: Room | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

export const useRoomStore = create<RoomState>((set) => ({
  currentRoom: null,
  isLoading: false,
  error: null,

  setCurrentRoom: (room) => set({ currentRoom: room }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
}))
