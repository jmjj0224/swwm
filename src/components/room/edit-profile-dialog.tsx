'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { ColorPicker } from '@/components/user/color-picker'
import { supabase } from '@/lib/supabase/client'
import { useUserStore } from '@/lib/stores/user-store'
import { getColorByValue, getRandomColor, type UserColor } from '@/lib/utils/colors'
import { RoomGroup } from '@/types/room'
import { Users, Sparkles } from 'lucide-react'

interface EditProfileDialogProps {
  isOpen: boolean
  onClose: () => void
  profile: {
    id: string
    name: string
    color: string
    tags?: string[]
  }
  roomId: string
  roomCode: string
  onUpdate: () => void
}

export function EditProfileDialog({
  isOpen,
  onClose,
  profile,
  roomId,
  roomCode,
  onUpdate,
}: EditProfileDialogProps) {
  const { updateProfile } = useUserStore()

  const [name, setName] = useState(profile.name)
  const [selectedColor, setSelectedColor] = useState<UserColor>(
    getColorByValue(profile.color) || getRandomColor()
  )
  const [selectedTags, setSelectedTags] = useState<string[]>(profile.tags || [])
  const [groups, setGroups] = useState<RoomGroup[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setName(profile.name)
      setSelectedColor(getColorByValue(profile.color) || getRandomColor())
      setSelectedTags(profile.tags || [])
      loadGroups()
    }
  }, [isOpen, profile])

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
    setSelectedTags((prev) =>
      prev.includes(groupName)
        ? prev.filter((t) => t !== groupName)
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
      // room_users 테이블 업데이트
      const { error } = await supabase
        .from('room_users')
        .update({
          name: name.trim(),
          color: selectedColor.value,
          tags: selectedTags,
        })
        .eq('room_id', roomId)
        .eq('user_id', profile.id)

      if (error) throw error

      // localStorage 업데이트
      const updatedProfile = {
        id: profile.id,
        name: name.trim(),
        color: selectedColor.value,
        tags: selectedTags,
      }

      updateProfile(roomCode.toUpperCase(), profile.id, updatedProfile)

      alert('✅ 프로필이 수정되었습니다!')
      onUpdate()
      onClose()
    } catch (error: any) {
      console.error('프로필 수정 실패:', error)
      alert(`프로필 수정에 실패했습니다\n\n${error.message || '알 수 없는 오류'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>프로필 수정</DialogTitle>
          <DialogDescription>이름, 색상, 그룹을 변경할 수 있습니다</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 이름 */}
          <div className="space-y-2">
            <Label htmlFor="edit-name">이름</Label>
            <Input
              id="edit-name"
              placeholder="홍길동"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={50}
              autoFocus
            />
          </div>

          {/* 색상 */}
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

          {/* 그룹 태그 선택 */}
          {groups.length > 0 && (
            <div className="space-y-3 p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-purple-600" />
                <Label className="text-sm font-semibold text-purple-900">
                  소속 그룹 (선택사항)
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
                      borderColor: selectedTags.includes(group.name)
                        ? group.color
                        : undefined,
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

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              취소
            </Button>
            <Button type="submit" disabled={isSubmitting || !name.trim()}>
              {isSubmitting ? '수정 중...' : '저장'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
