'use client'

import { AdUnit } from 'next-google-adsense'

interface AdBannerProps {
  slot?: string
  className?: string
  layout?: 'display' | 'in-article' | 'in-feed'
}

export function AdBanner({
  slot = '0000000000',
  className = '',
  layout = 'display'
}: AdBannerProps) {
  const publisherId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID

  // AdSense 클라이언트 ID가 없으면 렌더링하지 않음
  if (!publisherId) {
    return null
  }

  return (
    <div className={`my-8 flex justify-center ${className}`}>
      <div className="w-full max-w-4xl">
        <AdUnit
          publisherId={publisherId}
          slotId={slot}
          layout={layout}
        />
      </div>
    </div>
  )
}
