'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { supabase } from '@/lib/supabase/client'
import { generateRoomCode } from '@/lib/utils/room-code'
import { Copy, Check, Lock, Sparkles } from 'lucide-react'
import { BetaBanner } from './beta-banner'
import { passwordSchema, validateInput } from '@/lib/validation/schemas'

export function CreateRoom() {
  const router = useRouter()
  const [roomCode, setRoomCode] = useState('')
  const [password, setPassword] = useState('')
  const [usePassword, setUsePassword] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [copied, setCopied] = useState(false)

  const hashPassword = async (password: string): Promise<string> => {
    const encoder = new TextEncoder()
    const data = encoder.encode(password)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
  }

  const handleCreateRoom = async () => {
    setIsCreating(true)
    const code = generateRoomCode()

    try {
      // 비밀번호 검증
      if (usePassword && password.trim()) {
        const validation = validateInput(passwordSchema, password.trim())
        if (!validation.success) {
          alert(validation.error)
          setIsCreating(false)
          return
        }
      }

      // 비밀번호 해시 (선택 사항)
      let hashedPassword: string | null = null
      if (usePassword && password.trim()) {
        hashedPassword = await hashPassword(password.trim())
      }

      const { data, error } = await supabase
        .from('rooms')
        .insert({
          code,
          password: hashedPassword,
          is_premium: true,  // 베타 기간이므로 모두 프리미엄
          created_before_paid_launch: true,  // 유료화 전 생성 (평생 무료)
        })
        .select()
        .single()

      if (error) {
        throw error
      }

      setRoomCode(code)
    } catch (error: any) {
      alert(`방 생성에 실패했습니다.\n\n${error.message || '알 수 없는 오류'}`)
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
      <>
        <BetaBanner />
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

            {usePassword && password && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <Lock className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-yellow-800">
                    <p className="font-semibold mb-1">🔒 비밀번호가 설정되었습니다</p>
                    <p className="leading-relaxed">
                      입장 시 비밀번호가 필요합니다. 초대할 사람에게 비밀번호를 함께 알려주세요.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <Button onClick={handleEnterRoom} className="w-full" size="lg">
              방 입장하기
            </Button>
          </CardContent>
        </Card>
      </>
    )
  }

  return (
    <>
      <BetaBanner />
      <Card>
        <CardHeader>
          <CardTitle>새 방 만들기</CardTitle>
          <CardDescription>
            약속을 잡을 새로운 방을 생성합니다
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 비밀번호 설정 옵션 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="use-password"
                checked={usePassword}
                onChange={(e) => setUsePassword(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="use-password" className="flex items-center gap-2 cursor-pointer">
                <Lock className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium">
                  비밀번호로 방 보호하기
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
                  <Sparkles className="h-3 w-3" />
                  프리미엄
                </span>
              </Label>
            </div>

            {usePassword && (
              <div className="space-y-2 pl-6">
                <Label htmlFor="password" className="text-sm text-gray-700">
                  비밀번호 (4자 이상)
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="비밀번호 입력"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={4}
                  className="max-w-xs"
                />
                <p className="text-xs text-gray-500 leading-relaxed">
                  💡 초대받은 사람만 입장할 수 있도록 보호됩니다
                </p>
              </div>
            )}
          </div>

          <Button
            onClick={handleCreateRoom}
            disabled={isCreating || (usePassword && password.length < 4)}
            className="w-full"
            size="lg"
          >
            {isCreating ? '생성 중...' : '방 만들기'}
          </Button>
        </CardContent>
      </Card>
    </>
  )
}
