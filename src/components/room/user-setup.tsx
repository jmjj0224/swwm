'use client'

import { useState, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ColorPicker } from '@/components/user/color-picker'
import { supabase } from '@/lib/supabase/client'
import { useUserStore } from '@/lib/stores/user-store'
import { getRandomColor, type UserColor } from '@/lib/utils/colors'
import { RoomGroup } from '@/types/room'
import { Users, Sparkles } from 'lucide-react'

interface UserSetupProps {
  roomCode: string
  roomId: string
  isOpen: boolean
  onComplete?: () => void
  onClose?: () => void
}

export function UserSetup({ roomCode, roomId, isOpen, onComplete, onClose }: UserSetupProps) {
  const { addProfile } = useUserStore()

  const [name, setName] = useState('')
  const [selectedColor, setSelectedColor] = useState<UserColor>(getRandomColor())
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [groups, setGroups] = useState<RoomGroup[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isOpen) {
      loadGroups()
    }
  }, [isOpen, roomId])

  const loadGroups = async () => {
    const { data, error } = await supabase
      .from('room_groups')
      .select('*')
      .eq('room_id', roomId)
      .order('created_at', { ascending: true })

    if (!error && data) {
      setGroups(data)
    }
  }

  const toggleTag = (groupName: string) => {
    setSelectedTags(prev =>
      prev.includes(groupName)
        ? prev.filter(t => t !== groupName)
        : [...prev, groupName]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      alert('이름을 입력해주세요')
      return
    }

    setIsSubmitting(true)

    try {
      const userId = uuidv4()

      // room_users 테이블에 사용자 추가
      const { error } = await supabase
        .from('room_users')
        .insert({
          room_id: roomId,
          user_id: userId,
          name: name.trim(),
          color: selectedColor.value,
          tags: selectedTags,  // 선택된 그룹 태그
        })

      if (error) throw error

      // 프로필 추가
      const user = {
        id: userId,
        name: name.trim(),
        color: selectedColor.value,
      }

      addProfile(roomCode.toUpperCase(), user)

      console.log('프로필 추가 완료:', { user, roomCode })

      setIsSubmitting(false)

      // 부모 컴포넌트에 완료 알림
      if (onComplete) {
        onComplete()
      }
      if (onClose) {
        onClose()
      }
    } catch (error) {
      console.error('사용자 설정 실패:', error)
      alert('사용자 설정에 실패했습니다')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>프로필 설정</DialogTitle>
          <DialogDescription>
            방 코드: <span className="font-bold text-ios-blue">{roomCode}</span>
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">이름</Label>
            <Input
              id="name"
              placeholder="홍길동"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={50}
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label>색상 선택</Label>
            <ColorPicker
              selectedColor={selectedColor.value}
              onColorSelect={setSelectedColor}
            />
            <p className="text-sm text-gray-500 text-center mt-2">
              선택한 색상: <span className="font-semibold">{selectedColor.name}</span>
            </p>
          </div>

          {/* 그룹 태그 선택 (프리미엄) */}
          {groups.length > 0 && (
            <div className="space-y-3 p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-purple-600" />
                <Label className="text-sm font-semibold text-purple-900">
                  소속 그룹 선택 (선택사항)
                </Label>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-200 text-purple-700 rounded-full text-xs font-semibold">
                  <Sparkles className="h-3 w-3" />
                  프리미엄
                </span>
              </div>
              <p className="text-xs text-purple-800">
                여러 그룹에 속할 수 있습니다 (다중 선택 가능)
              </p>
              <div className="flex flex-wrap gap-2">
                {groups.map((group) => (
                  <button
                    key={group.id}
                    type="button"
                    onClick={() => toggleTag(group.name)}
                    className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition ${
                      selectedTags.includes(group.name)
                        ? 'bg-white border-2 shadow-sm'
                        : 'bg-white/50 border border-purple-200 hover:bg-white'
                    }`}
                    style={{
                      borderColor: selectedTags.includes(group.name) ? group.color : undefined,
                    }}
                  >
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: group.color }}
                    />
                    <span>{group.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <Button
            type="submit"
            disabled={isSubmitting || !name.trim()}
            className="w-full"
            size="lg"
          >
            {isSubmitting ? '설정 중...' : '입장하기'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
