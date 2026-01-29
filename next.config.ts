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
        ],
      },
    ]
  },
}

export default nextConfig