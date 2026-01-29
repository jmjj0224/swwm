'use client'

import { useEffect } from 'react'

interface AdBannerProps {
  slot?: string
  className?: string
  format?: 'auto' | 'fluid' | 'rectangle' | 'vertical' | 'horizontal'
  responsive?: boolean
}

export function AdBanner({
  slot,
  className = '',
  format = 'auto',
  responsive = true,
}: AdBannerProps) {
  const publisherId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || 'ca-pub-3706841120046770'

  useEffect(() => {
    try {
      // AdSense 광고 로드
      if (typeof window !== 'undefined') {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({})
      }
    } catch (error) {
      console.error('AdSense error:', error)
    }
  }, [])

  // AdSense 승인 전에는 광고가 표시되지 않으므로 공간만 예약
  return (
    <div className={`my-8 flex justify-center ${className}`}>
      <div className="w-full max-w-4xl">
        <ins
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client={publisherId}
          data-ad-slot={slot}
          data-ad-format={format}
          data-full-width-responsive={responsive ? 'true' : 'false'}
        />
      </div>
    </div>
  )
}
