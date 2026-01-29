import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  typescript: {
    // 프로덕션 빌드 시 타입 오류가 있어도 무시하고 배포
    ignoreBuildErrors: true,
  },
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  // 보안 헤더 설정
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY', // iframe 삽입 방지
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff', // MIME 타입 스니핑 방지
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block', // XSS 공격 방지
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin', // 리퍼러 정보 보호
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()', // 불필요한 권한 차단
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: https://pagead2.googlesyndication.com https://www.googletagmanager.com https://adservice.google.com https://*.google.com https://googleads.g.doubleclick.net https://*.googlesyndication.com",
              "script-src-elem 'self' 'unsafe-inline' blob: https://pagead2.googlesyndication.com https://www.googletagmanager.com https://adservice.google.com https://*.google.com https://googleads.g.doubleclick.net https://*.googlesyndication.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "img-src 'self' data: https: blob:",
              "font-src 'self' data: https://fonts.gstatic.com",
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://pagead2.googlesyndication.com https://*.google.com https://googleads.g.doubleclick.net https://*.googlesyndication.com https://adservice.google.com https://ep1.adtrafficquality.google",
              "frame-src 'self' https://googleads.g.doubleclick.net https://tpc.googlesyndication.com https://*.googlesyndication.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; '),
          },
        ],
      },
    ]
  },
}

export default nextConfig