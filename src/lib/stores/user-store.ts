import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export interface User {
  id: string
  name: string
  color: string
}

interface CurrentProfiles {
  [roomCode: string]: string // 방별 현재 선택된 프로필 ID (DB의 user_id)
}

interface UserState {
  currentProfiles: CurrentProfiles
  onlineUsers: User[]
  cachedUsers: { [roomCode: string]: User[] } // 캐시된 방 사용자 목록

  // 현재 선택된 프로필 ID 가져오기
  getCurrentUserId: (roomCode: string) => string | null

  // 현재 선택된 프로필 정보 가져오기 (캐시에서)
  getCurrentUser: (roomCode: string) => User | null

  // 캐시된 사용자 목록 가져오기
  getRoomProfiles: (roomCode: string) => User[]

  // 캐시 업데이트
  setCachedUsers: (roomCode: string, users: User[]) => void

  // 프로필 추가 (DB + 캐시 + 선택)
  addProfile: (roomCode: string, user: User) => void

  // 프로필 선택
  selectProfile: (roomCode: string, userId: string) => void

  // 온라인 사용자 설정
  setOnlineUsers: (users: User[]) => void

  // 프로필 삭제 (캐시에서만)
  deleteProfile: (roomCode: string, userId: string) => void

  // 방 데이터 초기화
  clearRoom: (roomCode: string) => void
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      currentProfiles: {},
      onlineUsers: [],
      cachedUsers: {},

      getCurrentUserId: (roomCode: string) => {
        return get().currentProfiles[roomCode] || null
      },

      getCurrentUser: (roomCode: string) => {
        const state = get()
        const userId = state.currentProfiles[roomCode]
        if (!userId) return null

        const cached = state.cachedUsers[roomCode] || []
        return cached.find((u) => u.id === userId) || null
      },

      getRoomProfiles: (roomCode: string) => {
        return get().cachedUsers[roomCode] || []
      },

      setCachedUsers: (roomCode: string, users: User[]) => {
        set((state) => ({
          cachedUsers: {
            ...state.cachedUsers,
            [roomCode]: users,
          },
        }))
      },

      addProfile: (roomCode: string, user: User) => {
        set((state) => {
          const cached = state.cachedUsers[roomCode] || []
          return {
            cachedUsers: {
              ...state.cachedUsers,
              [roomCode]: [...cached, user],
            },
            currentProfiles: {
              ...state.currentProfiles,
              [roomCode]: user.id,
            },
          }
        })
      },

      selectProfile: (roomCode: string, userId: string) => {
        console.log('프로필 선택:', { roomCode, userId })
        set((state) => ({
          currentProfiles: {
            ...state.currentProfiles,
            [roomCode]: userId,
          },
        }))
      },

      setOnlineUsers: (users) => set({ onlineUsers: users }),

      deleteProfile: (roomCode: string, userId: string) => {
        set((state) => {
          const cached = state.cachedUsers[roomCode] || []
          const newCached = cached.filter((p) => p.id !== userId)

          // 삭제된 프로필이 현재 선택된 것이면 초기화
          const newCurrentProfiles = { ...state.currentProfiles }
          if (state.currentProfiles[roomCode] === userId) {
            delete newCurrentProfiles[roomCode]
          }

          return {
            cachedUsers: {
              ...state.cachedUsers,
              [roomCode]: newCached,
            },
            currentProfiles: newCurrentProfiles,
          }
        })
      },

      clearRoom: (roomCode: string) => {
        set((state) => {
          const newCachedUsers = { ...state.cachedUsers }
          const newCurrentProfiles = { ...state.currentProfiles }
          delete newCachedUsers[roomCode]
          delete newCurrentProfiles[roomCode]

          return {
            cachedUsers: newCachedUsers,
            currentProfiles: newCurrentProfiles,
          }
        })
      },
    }),
    {
      name: 'swwm-user-storage-v3',
      storage: createJSONStorage(() => localStorage),
    }
  )
)

// 편의 함수: 현재 사용자 정보 가져오기 (hook 외부에서 사용)
export function getCurrentUser(roomCode: string): User | null {
  return useUserStore.getState().getCurrentUser(roomCode)
}
