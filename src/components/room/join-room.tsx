'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { supabase } from '@/lib/supabase/client'
import { validateRoomCode } from '@/lib/utils/room-code'
import { Lock } from 'lucide-react'
import { BetaBanner } from './beta-banner'
import { roomCodeSchema, passwordSchema, validateInput } from '@/lib/validation/schemas'

export function JoinRoom() {
  const router = useRouter()
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [needsPassword, setNeedsPassword] = useState(false)
  const [isJoining, setIsJoining] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const hashPassword = async (password: string): Promise<string> => {
    const encoder = new TextEncoder()
    const data = encoder.encode(password)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
  }

  const handleJoinRoom = async () => {
    setError(null)

    // Zod 코드 검증
    const codeValidation = validateInput(roomCodeSchema, code)
    if (!codeValidation.success) {
      setError(codeValidation.error || '올바른 방 코드 형식이 아닙니다')
      return
    }

    // 비밀번호 검증 (필요한 경우)
    if (needsPassword && password) {
      const passwordValidation = validateInput(passwordSchema, password)
      if (!passwordValidation.success) {
        setError(passwordValidation.error || '올바른 비밀번호 형식이 아닙니다')
        return
      }
    }

    setIsJoining(true)

    try {
      // 방 존재 확인
      const { data: room, error: roomError } = await supabase
        .from('rooms')
        .select('*')
        .eq('code', code.toUpperCase())
        .single()

      if (roomError || !room) {
        setError('존재하지 않는 방 코드입니다')
        return
      }

      // 방이 만료되었는지 확인
      const expiresAt = new Date(room.expires_at)
      if (expiresAt < new Date()) {
        setError('만료된 방입니다')
        return
      }

      // 비밀번호 확인
      if (room.password) {
        if (!needsPassword) {
          // 비밀번호가 필요함을 알림
          setNeedsPassword(true)
          setIsJoining(false)
          return
        }

        // 비밀번호 검증
        const hashedPassword = await hashPassword(password)
        if (hashedPassword !== room.password) {
          setError('비밀번호가 올바르지 않습니다')
          setIsJoining(false)
          return
        }
      }

      // 방 입장
      router.push(`/room/${code.toUpperCase()}`)
    } catch (error) {
      console.error('방 입장 실패:', error)
      setError('방 입장에 실패했습니다')
    } finally {
      setIsJoining(false)
    }
  }

  return (
    <>
      <BetaBanner />
      <Card>
        <CardHeader>
          <CardTitle>방 들어가기</CardTitle>
          <CardDescription>
            6자리 방 코드를 입력하세요
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="room-code">방 코드</Label>
            <Input
              id="room-code"
              placeholder="예: AB12CD"
              value={code}
              onChange={(e) => {
                setCode(e.target.value.toUpperCase())
                setNeedsPassword(false)
                setError(null)
              }}
              maxLength={6}
              className="text-center text-2xl tracking-wider font-semibold"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !needsPassword) {
                  handleJoinRoom()
                }
              }}
            />
          </div>

          {needsPassword && (
            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-purple-600" />
                <span>비밀번호</span>
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="비밀번호 입력"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setError(null)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleJoinRoom()
                  }
                }}
              />
              <p className="text-xs text-gray-500">
                🔒 이 방은 비밀번호로 보호되고 있습니다
              </p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <Button
            onClick={handleJoinRoom}
            disabled={isJoining || code.length !== 6 || (needsPassword && !password)}
            className="w-full"
            size="lg"
          >
            {isJoining ? '확인 중...' : needsPassword ? '비밀번호 확인' : '입장하기'}
          </Button>
        </CardContent>
      </Card>
    </>
  )
}
