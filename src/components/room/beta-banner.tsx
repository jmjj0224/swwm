'use client'

import { Sparkles } from 'lucide-react'

export function BetaBanner() {
  return (
    <div className="bg-gradient-to-r from-purple-50 via-blue-50 to-purple-50 border-2 border-purple-200 rounded-xl p-4 mb-6">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          <Sparkles className="h-5 w-5 text-purple-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-bold text-purple-900 mb-1">
            🎉 베타 서비스 기간 - 모든 프리미엄 기능 무료!
          </h3>
          <p className="text-xs text-purple-800 leading-relaxed">
            <strong>그룹 태그</strong>와 <strong>비밀번호 보호</strong> 등
            프리미엄 기능을 무료로 체험하세요.
            <span className="inline-block mt-1 px-2 py-0.5 bg-purple-200 rounded-full font-semibold">
              지금 생성된 방은 유료화 이후에도 평생 무료
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}
