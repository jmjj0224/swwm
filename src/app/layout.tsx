import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import './globals.css'

export const metadata: Metadata = {
  title: '약속 캘린더 - SWWM',
  description: '비는 시간을 공유하고 최적의 약속 시간을 찾아보세요. 여러 사람의 일정을 실시간으로 공유하고 모두가 가능한 최적의 시간을 자동으로 찾아드립니다.',
  keywords: ['약속', '캘린더', '일정', '스케줄', '시간 조율', '모임', '약속 잡기', 'SWWM'],
  authors: [{ name: 'SWWM Team' }],
  openGraph: {
    title: '약속 캘린더 - SWWM',
    description: '비는 시간을 공유하고 최적의 약속 시간을 찾아보세요',
    type: 'website',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // 핀치 줌 방지 (앱처럼 보이게)
  viewportFit: 'cover', // 안드로이드 노치 영역 대응
  interactiveWidget: 'resizes-content', // 키보드가 올라올 때 화면 조정
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko">
      <head />
      <body className="antialiased font-sans">
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3706841120046770"
          crossOrigin="anonymous"
          strategy="beforeInteractive"
        />
        {children}
      </body>
    </html>
  )
}
