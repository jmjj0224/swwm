import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  typescript: {
    // !! 경고 !!
    // 프로덕션 빌드 시 타입 오류가 있어도 무시하고 배포합니다.
    ignoreBuildErrors: true,
  },
  eslint: {
    // 린트 오류가 있어도 무시합니다.
    ignoreDuringBuilds: true,
    experimental: {
      optimizePackageImports: ['lucide-react'],
    },
  }

export default nextConfig
