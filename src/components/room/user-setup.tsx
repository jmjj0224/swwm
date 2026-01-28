'use client'

import { useState } from 'react'
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
  const [isSubmitting, setIsSubmitting] = useState(false)

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
