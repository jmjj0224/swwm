'use client'

import { USER_COLORS, type UserColor } from '@/lib/utils/colors'
import { cn } from '@/lib/utils/cn'
import { Check } from 'lucide-react'

interface ColorPickerProps {
  selectedColor: string
  onColorSelect: (color: UserColor) => void
}

export function ColorPicker({ selectedColor, onColorSelect }: ColorPickerProps) {
  return (
    <div className="grid grid-cols-5 gap-3">
      {USER_COLORS.map((color) => (
        <button
          key={color.value}
          type="button"
          onClick={() => onColorSelect(color)}
          className={cn(
            'relative h-12 w-12 rounded-xl transition-all hover:scale-110',
            'focus:outline-none focus:ring-2 focus:ring-ios-blue focus:ring-offset-2',
            selectedColor === color.value && 'ring-2 ring-ios-blue ring-offset-2'
          )}
          style={{ backgroundColor: color.value }}
          title={color.name}
        >
          {selectedColor === color.value && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Check className="h-6 w-6 text-white drop-shadow" />
            </div>
          )}
        </button>
      ))}
    </div>
  )
}
