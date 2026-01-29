'use client'

import { useEffect, useState } from 'react'
import { useParams, notFound, useRouter } from 'next/navigation'
import { UserSetup } from '@/components/room/user-setup'
import { CalendarView } from '@/components/calendar/calendar-view'
import { OnlineUsers } from '@/components/room/online-users'
import { GroupManager } from '@/components/room/group-manager'
import { EditProfileDialog } from '@/components/room/edit-profile-dialog'
import { RoomSettingsDialog } from '@/components/room/room-settings-dialog'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase/client'
import { useUserStore } from '@/lib/stores/user-store'
import { useRoomStore } from '@/lib/stores/room-store'
import { AdBanner } from '@/components/ads/ad-banner'
import { Home, Edit2 } from 'lucide-react'

export default function RoomPage() {
  const params = useParams()
  const router = useRouter()
  const roomCode = params.code as string
  const { getCurrentUser, getRoomProfiles, selectProfile, setCachedUsers } = useUserStore()
  const { currentRoom, setCurrentRoom, setLoading, setError } = useRoomStore()

  const [showSetup, setShowSetup] = useState(false)
  const [onlineCount, setOnlineCount] = useState(0)
  const [showProfileSelector, setShowProfileSelector] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editingProfile, setEditingProfile] = useState<any | null>(null)
  const [allRoomUsers, setAllRoomUsers] = useState<any[]>([])

  const currentUser = getCurrentUser(roomCode.toUpperCase())
  const roomProfiles = getRoomProfiles(roomCode.toUpperCase())

  useEffect(() => {
    async function loadRoom() {
      setLoading(true)
      setError(null)

      try {
        // 방 정보 가져오기
        const { data: room, error: roomError } = await supabase
          .from('rooms')
          .select('*')
          .eq('code', roomCode.toUpperCase())
          .single()

        if (roomError || !room) {
          notFound()
          return
        }

        // 방이 만료되었는지 확인
        const expiresAt = new Date(room.expires_at)
        if (expiresAt < new Date()) {
          setError('만료된 방입니다')
          return
        }

        setCurrentRoom(room)

        // 방의 모든 사용자 불러오기
        const { data: users, error: usersError } = await supabase
          .from('room_users')
          .select('*')
          .eq('room_id', room.id)
          .order('joined_at', { ascending: true })

        if (!usersError && users) {
          const mappedUsers = users.map(u => ({
            id: u.user_id,
            name: u.name,
            color: u.color,
            joinedAt: u.joined_at,
          }))

          setAllRoomUsers(mappedUsers)

          // Store 캐시 업데이트
          setCachedUsers(roomCode.toUpperCase(), mappedUsers)
        }
      } catch (error) {
        setError('방을 불러오는데 실패했습니다')
      } finally {
        setLoading(false)
      }
    }

    loadRoom()
  }, [roomCode])

  const handleSetupComplete = () => {
    setShowSetup(false)
  }

  const handleAddProfile = () => {
    setShowSetup(true)
  }

  const handleSelectProfile = (userId: string) => {
    selectProfile(roomCode.toUpperCase(), userId)
    setShowProfileSelector(false)
    // 강제 새로고침으로 UI 업데이트
    window.location.reload()
  }

  const handleDeleteSchedule = async (userId: string, userName: string) => {
    // 1차 확인
    if (!confirm(`${userName}님의 모든 일정을 삭제하시겠습니까?`)) {
      return
    }

    // 2차 확인
    if (!confirm(`정말로 ${userName}님의 모든 일정을 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`)) {
      return
    }

    try {
      const { error } = await supabase
        .from('time_selections')
        .delete()
        .eq('room_id', currentRoom!.id)
        .eq('user_id', userId)

      if (error) throw error

      alert(`${userName}님의 모든 일정이 삭제되었습니다.`)
    } catch (error) {
      alert('일정 삭제에 실패했습니다.')
    }
  }

  const handleDeleteProfile = async (userId: string, userName: string) => {
    // 1차 확인
    if (!confirm(`${userName} 프로필을 삭제하시겠습니까?\n\n⚠️ 프로필과 모든 일정이 영구적으로 삭제됩니다.`)) {
      return
    }

    // 2차 확인
    if (!confirm(`⚠️ 최종 확인\n\n정말로 "${userName}" 프로필을 완전히 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다!`)) {
      return
    }

    try {
      // 1단계: time_selections 먼저 삭제
      const { error: selectionsError } = await supabase
        .from('time_selections')
        .delete()
        .eq('room_id', currentRoom!.id)
        .eq('user_id', userId)

      if (selectionsError) {
        throw new Error(`일정 삭제 실패: ${selectionsError.message}`)
      }

      // 2단계: room_users에서 삭제
      const { error: userError } = await supabase
        .from('room_users')
        .delete()
        .eq('room_id', currentRoom!.id)
        .eq('user_id', userId)

      if (userError) {
        throw new Error(`프로필 삭제 실패: ${userError.message}`)
      }

      // localStorage에서도 제거
      const { deleteProfile: deleteProfileFromStore } = useUserStore.getState()
      deleteProfileFromStore(roomCode.toUpperCase(), userId)

      // 사용자 목록 새로고침
      const { data: users } = await supabase
        .from('room_users')
        .select('*')
        .eq('room_id', currentRoom!.id)
        .order('joined_at', { ascending: true })

      if (users) {
        const mappedUsers = users.map(u => ({
          id: u.user_id,
          name: u.name,
          color: u.color,
          joinedAt: u.joined_at,
        }))
        setAllRoomUsers(mappedUsers)
        setCachedUsers(roomCode.toUpperCase(), mappedUsers)
      }

      setShowProfileSelector(false)
      alert(`✅ ${userName} 프로필이 완전히 삭제되었습니다.`)

      // 삭제된 프로필이 현재 선택된 것이면 페이지 새로고침
      if (currentUser?.id === userId) {
        window.location.reload()
      }
    } catch (error: any) {
      alert(`❌ 프로필 삭제에 실패했습니다.\n\n${error.message || '알 수 없는 오류'}`)
    }
  }

  if (!currentRoom) {
    return (
      <div className="min-h-screen bg-ios-gray flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ios-blue mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-ios-gray">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="w-full px-2 py-3 md:container md:max-w-4xl md:mx-auto md:px-4 md:py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-shrink-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push('/')}
                className="flex-shrink-0"
                title="메인으로"
              >
                <Home className="h-5 w-5" />
              </Button>
              <RoomSettingsDialog
                roomId={currentRoom.id}
                roomCode={roomCode.toUpperCase()}
                creatorUserId={currentRoom.creator_user_id || null}
                currentPasswordHash={currentRoom.password_hash || null}
              />
              <div>
                <h1 className="text-xl font-bold">약속 캘린더</h1>
                <p className="text-sm text-gray-600">방 코드: {roomCode}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <GroupManager roomId={currentRoom.id} />
              <OnlineUsers roomId={currentRoom.id} roomCode={roomCode.toUpperCase()} onCountChange={setOnlineCount} />

              {/* 프로필 표시 */}
              <div className="flex items-center gap-2">
                {/* 현재 프로필 또는 선택 버튼 */}
                {currentUser ? (
                  <div className="flex items-center gap-2 bg-white rounded-full px-2 py-1 border shadow-sm">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0"
                      style={{ backgroundColor: currentUser.color }}
                    >
                      {currentUser.name[0]}
                    </div>
                    <span className="text-sm font-semibold mr-1">{currentUser.name}</span>
                    <button
                      onClick={() => setShowProfileSelector(!showProfileSelector)}
                      className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded hover:bg-gray-100"
                    >
                      변경
                    </button>
                  </div>
                ) : (
                  <Button
                    onClick={() => setShowProfileSelector(!showProfileSelector)}
                    size="sm"
                    className="flex-shrink-0"
                  >
                    프로필 선택
                  </Button>
                )}

                {/* + 버튼 (프로필 추가) */}
                <Button
                  onClick={handleAddProfile}
                  size="icon"
                  variant="outline"
                  className="h-9 w-9 rounded-full flex-shrink-0"
                  title="새 프로필 추가"
                >
                  +
                </Button>

                {/* 프로필 선택 드롭다운 */}
                {showProfileSelector && allRoomUsers.length > 0 && (
                  <div className="absolute top-16 right-4 bg-white rounded-lg shadow-xl border-2 p-3 z-50 min-w-[320px] max-h-[500px] overflow-y-auto">
                    <div className="flex items-center justify-between mb-3 pb-2 border-b">
                      <h3 className="text-sm font-bold text-gray-800">
                        일정 입력할 프로필 선택
                      </h3>
                      <button
                        onClick={() => setShowProfileSelector(false)}
                        className="text-gray-400 hover:text-gray-600 text-xl leading-none"
                      >
                        ×
                      </button>
                    </div>

                    <div className="space-y-1 mb-3">
                      {allRoomUsers.map((profile) => (
                        <div
                          key={profile.id}
                          className={`group flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-50 transition border ${
                            profile.id === currentUser?.id
                              ? 'bg-blue-50 border-blue-200'
                              : 'border-transparent'
                          }`}
                        >
                          {/* 프로필 선택 버튼 */}
                          <button
                            onClick={() => handleSelectProfile(profile.id)}
                            className="flex-1 flex items-center gap-3"
                          >
                            <div
                              className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                              style={{ backgroundColor: profile.color }}
                            >
                              {profile.name[0]}
                            </div>
                            <div className="flex-1 text-left">
                              <div className="text-sm font-semibold text-gray-800">
                                {profile.name}
                              </div>
                              {profile.id === currentUser?.id && (
                                <div className="text-xs text-blue-600">현재 선택됨</div>
                              )}
                            </div>
                          </button>

                          {/* 작업 버튼 */}
                          <div className="flex gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setEditingProfile(profile)
                                setShowEditDialog(true)
                                setShowProfileSelector(false)
                              }}
                              className="px-3 py-1.5 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 rounded font-medium flex items-center gap-1"
                              title="프로필 편집"
                            >
                              <Edit2 className="h-3 w-3" />
                              편집
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteSchedule(profile.id, profile.name)
                              }}
                              className="px-3 py-1.5 text-xs bg-yellow-100 hover:bg-yellow-200 text-yellow-700 rounded font-medium"
                              title="이 사람의 모든 일정 삭제"
                            >
                              일정삭제
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteProfile(profile.id, profile.name)
                              }}
                              className="px-3 py-1.5 text-xs bg-red-100 hover:bg-red-200 text-red-700 rounded font-medium"
                              title="프로필과 모든 일정 영구 삭제"
                            >
                              삭제
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                      <div className="text-xs text-blue-800 leading-relaxed">
                        💡 <strong>팁:</strong> 다른 사람의 프로필을 선택하면 그 사람의 일정을 대신 입력할 수 있어요.
                        (예: 친구가 시간표 사진을 보내줬을 때)
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="w-full px-2 py-4 md:container md:max-w-4xl md:mx-auto md:px-4 md:py-6">
        <div className="bg-white rounded-lg md:rounded-2xl shadow-sm p-4 md:p-6">
          <CalendarView roomCode={roomCode} roomId={currentRoom.id} />
        </div>

        {/* 광고 */}
        <AdBanner slot="room-bottom" />
      </main>

      {/* 프로필 설정 Dialog */}
      {currentRoom && (
        <UserSetup
          roomCode={roomCode.toUpperCase()}
          roomId={currentRoom.id}
          isOpen={showSetup}
          onComplete={handleSetupComplete}
          onClose={() => setShowSetup(false)}
        />
      )}

      {/* 프로필 편집 Dialog */}
      {currentRoom && editingProfile && (
        <EditProfileDialog
          isOpen={showEditDialog}
          onClose={() => {
            setShowEditDialog(false)
            setEditingProfile(null)
          }}
          profile={editingProfile}
          roomId={currentRoom.id}
          roomCode={roomCode.toUpperCase()}
          onUpdate={async () => {
            // 사용자 목록 새로고침
            const { data: users } = await supabase
              .from('room_users')
              .select('*')
              .eq('room_id', currentRoom.id)
              .order('joined_at', { ascending: true })

            if (users) {
              const mappedUsers = users.map((u) => ({
                id: u.user_id,
                name: u.name,
                color: u.color,
                joinedAt: u.joined_at,
                tags: u.tags || [],
              }))
              setAllRoomUsers(mappedUsers)
              setCachedUsers(roomCode.toUpperCase(), mappedUsers)
            }
          }}
        />
      )}
    </div>
  )
}
