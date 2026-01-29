'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { supabase } from '@/lib/supabase/client'
import { RoomGroup } from '@/types/room'
import { Users, Plus, X, Sparkles } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

interface GroupManagerProps {
  roomId: string
  onGroupsChange?: (groups: RoomGroup[]) => void
}

const GROUP_COLORS = [
  '#ef4444', // red
  '#f59e0b', // amber
  '#10b981', // emerald
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#14b8a6', // teal
  '#f97316', // orange
]

export function GroupManager({ roomId, onGroupsChange }: GroupManagerProps) {
  const [groups, setGroups] = useState<RoomGroup[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [newGroupName, setNewGroupName] = useState('')
  const [selectedColor, setSelectedColor] = useState(GROUP_COLORS[0])
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    loadGroups()
  }, [roomId])

  const loadGroups = async () => {
    const { data, error } = await supabase
      .from('room_groups')
      .select('*')
      .eq('room_id', roomId)
      .order('created_at', { ascending: true })

    if (!error && data) {
      setGroups(data)
      onGroupsChange?.(data)
    }
  }

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) {
      alert('그룹 이름을 입력해주세요')
      return
    }

    setIsCreating(true)

    try {
      const { error } = await supabase
        .from('room_groups')
        .insert({
          room_id: roomId,
          name: newGroupName.trim(),
          color: selectedColor,
        })

      if (error) {
        if (error.code === '23505') {
          alert('이미 같은 이름의 그룹이 존재합니다')
        } else {
          throw error
        }
        return
      }

      setNewGroupName('')
      setSelectedColor(GROUP_COLORS[0])
      await loadGroups()
    } catch (error: any) {
      alert(`그룹 생성에 실패했습니다\n\n${error.message}`)
    } finally {
      setIsCreating(false)
    }
  }

  const handleDeleteGroup = async (groupId: string, groupName: string) => {
    if (!confirm(`"${groupName}" 그룹을 삭제하시겠습니까?\n\n그룹에 속한 멤버들의 태그도 함께 제거됩니다.`)) {
      return
    }

    try {
      const { error } = await supabase
        .from('room_groups')
        .delete()
        .eq('id', groupId)

      if (error) throw error

      await loadGroups()
    } catch (error: any) {
      alert(`그룹 삭제에 실패했습니다\n\n${error.message}`)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Users className="h-4 w-4" />
          <span>그룹 관리</span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
            <Sparkles className="h-3 w-3" />
            {groups.length}
          </span>
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-purple-600" />
            그룹 관리
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
              <Sparkles className="h-3 w-3" />
              프리미엄
            </span>
          </DialogTitle>
          <DialogDescription>
            팀별로 약속을 잡을 수 있도록 그룹을 만들어보세요
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* 그룹 생성 */}
          <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
            <Label>새 그룹 만들기</Label>
            <Input
              placeholder="그룹 이름 (예: 1팀, 보컬팀)"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              maxLength={20}
            />

            {/* 색상 선택 */}
            <div className="space-y-2">
              <Label className="text-xs">그룹 색상</Label>
              <div className="flex gap-2 flex-wrap">
                {GROUP_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`w-8 h-8 rounded-full transition ${
                      selectedColor === color
                        ? 'ring-2 ring-offset-2 ring-gray-400 scale-110'
                        : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <Button
              onClick={handleCreateGroup}
              disabled={isCreating || !newGroupName.trim()}
              className="w-full"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              그룹 추가
            </Button>
          </div>

          {/* 그룹 목록 */}
          <div className="space-y-2">
            <Label className="text-sm text-gray-700">생성된 그룹 ({groups.length}개)</Label>
            {groups.length === 0 ? (
              <div className="text-center py-8 text-sm text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>아직 생성된 그룹이 없습니다</p>
                <p className="text-xs mt-1">위에서 첫 그룹을 만들어보세요!</p>
              </div>
            ) : (
              <div className="space-y-1 max-h-60 overflow-y-auto">
                {groups.map((group) => (
                  <div
                    key={group.id}
                    className="flex items-center gap-3 p-3 bg-white border rounded-lg hover:bg-gray-50 transition"
                  >
                    <div
                      className="w-4 h-4 rounded-full flex-shrink-0"
                      style={{ backgroundColor: group.color }}
                    />
                    <span className="flex-1 font-medium text-sm">{group.name}</span>
                    <button
                      onClick={() => handleDeleteGroup(group.id, group.name)}
                      className="text-gray-400 hover:text-red-500 transition"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 안내 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-800 leading-relaxed">
              💡 <strong>사용 방법:</strong> 그룹을 만든 후, 각 멤버의 프로필에서 그룹을 할당하세요.
              약속 잡기에서 특정 그룹만 필터링할 수 있습니다.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
