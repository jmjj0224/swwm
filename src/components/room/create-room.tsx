'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase } from '@/lib/supabase/client'
import { generateRoomCode } from '@/lib/utils/room-code'
import { Copy, Check } from 'lucide-react'

export function CreateRoom() {
  const router = useRouter()
  const [roomCode, setRoomCode] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleCreateRoom = async () => {
    setIsCreating(true)
    const code = generateRoomCode()

    try {
      console.log('방 생성 시도:', code)

      const { data, error } = await supabase
        .from('rooms')
        .insert({ code })
        .select()
        .single()

      console.log('Supabase 응답:', { data, error })

      if (error) {
        console.error('Supabase 에러 상세:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        })
        throw error
      }

      console.log('방 생성 성공:', data)
      setRoomCode(code)
    } catch (error: any) {
      console.error('방 생성 실패:', error)
      alert(`방 생성에 실패했습니다.\n\n에러: ${error.message || '알 수 없는 오류'}\n\n개발자 콘솔을 확인해주세요.`)
    } finally {
      setIsCreating(false)
    }
  }

  const handleCopyCode = async () => {
    await navigator.clipboard.writeText(roomCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleEnterRoom = () => {
    router.push(`/room/${roomCode}`)
  }

  if (roomCode) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>방이 생성되었습니다! 🎉</CardTitle>
          <CardDescription>
            아래 코드를 공유하여 멤버들을 초대하세요
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-ios-gray rounded-xl p-4 text-center">
              <p className="text-3xl font-bold tracking-wider text-ios-blue">
                {roomCode}
              </p>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={handleCopyCode}
              className="shrink-0"
            >
              {copied ? (
                <Check className="h-5 w-5 text-green-500" />
              ) : (
                <Copy className="h-5 w-5" />
              )}
            </Button>
          </div>

          <Button onClick={handleEnterRoom} className="w-full" size="lg">
            방 입장하기
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>새 방 만들기</CardTitle>
        <CardDescription>
          약속을 잡을 새로운 방을 생성합니다
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          onClick={handleCreateRoom}
          disabled={isCreating}
          className="w-full"
          size="lg"
        >
          {isCreating ? '생성 중...' : '방 만들기'}
        </Button>
      </CardContent>
    </Card>
  )
}
