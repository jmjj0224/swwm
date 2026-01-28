'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useUserStore } from '@/lib/stores/user-store'
import type { RealtimeChannel } from '@supabase/supabase-js'

interface OnlineUser {
  userId: string
  name: string
  color: string
  lastActiveAt: string
}

interface OnlineUsersProps {
  roomId: string
  roomCode: string
  onCountChange?: (count: number) => void
}

export function OnlineUsers({ roomId, roomCode, onCountChange }: OnlineUsersProps) {
  const getCurrentUser = useUserStore((state) => state.getCurrentUser)
  const currentUser = getCurrentUser(roomCode.toUpperCase())
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([])
  const [channel, setChannel] = useState<RealtimeChannel | null>(null)

  useEffect(() => {
    if (!currentUser) return

    console.log('🌐 Presence 채널 구독 시작:', roomId)

    const presenceChannel = supabase.channel(`room:${roomId}:presence`, {
      config: {
        presence: {
          key: currentUser.id,
        },
      },
    })

    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState()
        console.log('👥 Presence 동기화:', state)

        const users: OnlineUser[] = []
        for (const userId in state) {
          const presences = state[userId] as any[]
          if (presences.length > 0) {
            const user = presences[0]
            users.push({
              userId: user.userId || userId,
              name: user.name,
              color: user.color,
              lastActiveAt: user.lastActiveAt,
            })
          }
        }

        setOnlineUsers(users)
        console.log('✅ 온라인 사용자:', users.length, '명')

        if (onCountChange) {
          onCountChange(users.length)
        }
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('👋 사용자 입장:', key, newPresences)
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('👋 사용자 퇴장:', key, leftPresences)
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          console.log('📡 Presence 구독 완료')
          await presenceChannel.track({
            userId: currentUser.id,
            name: currentUser.name,
            color: currentUser.color,
            lastActiveAt: new Date().toISOString(),
          })
          console.log('✅ Presence 추적 시작:', currentUser.name)
        }
      })

    setChannel(presenceChannel)

    return () => {
      console.log('🔌 Presence 구독 해제')
      presenceChannel.unsubscribe()
    }
  }, [roomId, currentUser])

  if (onlineUsers.length === 0) return null

  return (
    <div className="flex items-center gap-2 overflow-x-auto">
      <div className="text-xs text-gray-500 font-medium whitespace-nowrap">
        온라인 {onlineUsers.length}명
      </div>
      <div className="flex items-center gap-1">
        {onlineUsers.map((user) => (
          <div
            key={user.userId}
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold border-2 border-white shadow-sm"
            style={{ backgroundColor: user.color }}
            title={user.name}
          >
            {user.name[0]}
          </div>
        ))}
      </div>
    </div>
  )
}
