'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { supabase } from '@/lib/supabase/client'
import { validateRoomCode } from '@/lib/utils/room-code'

export function JoinRoom() {
  const router = useRouter()
  const [code, setCode] = useState('')
  const [isJoining, setIsJoining] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleJoinRoom = async () => {
    setError(null)

    // 코드 검증
    if (!validateRoomCode(code)) {
      setError('올바른 방 코드 형식이 아닙니다 (6자리 영문+숫자)')
      return
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
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            maxLength={6}
            className="text-center text-2xl tracking-wider font-semibold"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleJoinRoom()
              }
            }}
          />
          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}
        </div>

        <Button
          onClick={handleJoinRoom}
          disabled={isJoining || code.length !== 6}
          className="w-full"
          size="lg"
        >
          {isJoining ? '확인 중...' : '입장하기'}
        </Button>
      </CardContent>
    </Card>
  )
}
