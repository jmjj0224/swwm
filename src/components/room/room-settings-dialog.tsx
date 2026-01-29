'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useUserStore } from '@/lib/stores/user-store'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Settings } from 'lucide-react'
import { passwordSchema, validateInput } from '@/lib/validation/schemas'

interface RoomSettingsDialogProps {
  roomId: string
  roomCode: string
  creatorUserId: string | null
  currentPasswordHash: string | null
}

export function RoomSettingsDialog({
  roomId,
  roomCode,
  creatorUserId,
  currentPasswordHash,
}: RoomSettingsDialogProps) {
  const [open, setOpen] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isRemovingPassword, setIsRemovingPassword] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const { currentUser } = useUserStore()

  const isCreator = currentUser?.id === creatorUserId
  const hasPassword = !!currentPasswordHash

  if (!isCreator) {
    return null // 방장만 설정 버튼 표시
  }

  const hashPassword = async (password: string): Promise<string> => {
    const encoder = new TextEncoder()
    const data = encoder.encode(password)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }

  const handleSetPassword = async () => {
    if (isRemovingPassword) {
      // 비밀번호 제거
      setIsSaving(true)
      try {
        const { error } = await supabase
          .from('rooms')
          .update({ password_hash: null })
          .eq('id', roomId)

        if (error) {
          alert('비밀번호 제거 실패: ' + error.message)
          return
        }

        alert('비밀번호가 제거되었습니다. 이제 누구나 방에 입장할 수 있습니다.')
        setOpen(false)
        setIsRemovingPassword(false)
      } catch (error: any) {
        alert('오류가 발생했습니다: ' + error.message)
      } finally {
        setIsSaving(false)
      }
      return
    }

    // 비밀번호 설정/변경
    if (!password) {
      alert('비밀번호를 입력해주세요')
      return
    }

    if (password !== confirmPassword) {
      alert('비밀번호가 일치하지 않습니다')
      return
    }

    const validation = validateInput(passwordSchema, password)
    if (!validation.success) {
      alert(validation.error)
      return
    }

    setIsSaving(true)
    try {
      const passwordHash = await hashPassword(password)

      const { error } = await supabase
        .from('rooms')
        .update({ password_hash: passwordHash })
        .eq('id', roomId)

      if (error) {
        alert('비밀번호 설정 실패: ' + error.message)
        return
      }

      alert('비밀번호가 설정되었습니다.')
      setPassword('')
      setConfirmPassword('')
      setOpen(false)
    } catch (error: any) {
      alert('오류가 발생했습니다: ' + error.message)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>방 설정</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* 방 정보 */}
          <div className="space-y-2">
            <Label>방 코드</Label>
            <div className="text-2xl font-bold text-center py-4 bg-gray-100 rounded-lg">
              {roomCode}
            </div>
          </div>

          {/* 비밀번호 설정 */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>방 비밀번호</Label>
              {hasPassword && (
                <span className="text-xs text-green-600 font-medium">설정됨</span>
              )}
            </div>

            {hasPassword && !isRemovingPassword && (
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  현재 방에 비밀번호가 설정되어 있습니다.
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsRemovingPassword(true)}
                    className="flex-1"
                  >
                    비밀번호 제거
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setPassword('')
                      setConfirmPassword('')
                    }}
                    className="flex-1"
                  >
                    비밀번호 변경
                  </Button>
                </div>
              </div>
            )}

            {isRemovingPassword && (
              <div className="space-y-2">
                <p className="text-sm text-red-600">
                  정말 비밀번호를 제거하시겠습니까? 제거하면 누구나 방에 입장할 수 있습니다.
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="destructive"
                    onClick={handleSetPassword}
                    disabled={isSaving}
                    className="flex-1"
                  >
                    {isSaving ? '제거 중...' : '제거 확인'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsRemovingPassword(false)}
                    disabled={isSaving}
                    className="flex-1"
                  >
                    취소
                  </Button>
                </div>
              </div>
            )}

            {!isRemovingPassword && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">
                    {hasPassword ? '새 비밀번호' : '비밀번호'}
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="최소 4자 이상"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isSaving}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">비밀번호 확인</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="비밀번호 재입력"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isSaving}
                  />
                </div>

                <Button
                  onClick={handleSetPassword}
                  disabled={isSaving || !password}
                  className="w-full"
                >
                  {isSaving ? '저장 중...' : hasPassword ? '비밀번호 변경' : '비밀번호 설정'}
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
