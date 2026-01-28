import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, Calendar, Users, Zap, Shield } from 'lucide-react'
import { AdBanner } from '@/components/ads/ad-banner'

export const metadata: Metadata = {
  title: '소개 - SWWM',
  description: 'SWWM 약속 캘린더는 여러 사람의 일정을 실시간으로 공유하고 최적의 약속 시간을 찾아드립니다.',
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <Link
          href="/"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          홈으로 돌아가기
        </Link>

        <article className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold mb-6">SWWM 약속 캘린더 소개</h1>

          <section className="mb-12">
            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              SWWM("약속 캘린더")은 여러 사람의 일정을 간편하게 공유하고,
              모두가 가능한 최적의 시간을 자동으로 찾아주는 웹 서비스입니다.
            </p>
            <p className="text-gray-600 leading-relaxed">
              모임, 회의, 약속 등 여러 사람이 함께 모여야 할 때,
              각자의 비는 시간을 입력하면 실시간으로 동기화되어
              가장 많은 사람이 참석 가능한 시간대를 추천해드립니다.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-6">주요 기능</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">간편한 일정 공유</h3>
                  <p className="text-gray-600 text-sm">
                    6자리 방 코드만으로 즉시 일정 공유 시작.
                    별도 회원가입 없이 바로 사용 가능합니다.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Zap className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">실시간 동기화</h3>
                  <p className="text-gray-600 text-sm">
                    누군가 일정을 입력하면 모든 참여자에게 즉시 반영.
                    최신 정보를 항상 확인할 수 있습니다.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Users className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">최적 시간 자동 계산</h3>
                  <p className="text-gray-600 text-sm">
                    가장 많은 사람이 참석 가능한 시간대를 자동으로 찾아서
                    추천해드립니다.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <Shield className="h-6 w-6 text-red-600" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">안전한 데이터 관리</h3>
                  <p className="text-gray-600 text-sm">
                    7일 후 자동 삭제. 개인정보는 최소한만 수집하고
                    안전하게 관리합니다.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-6">사용 방법</h2>
            <ol className="space-y-4">
              <li className="flex gap-4">
                <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                  1
                </span>
                <div>
                  <h4 className="font-semibold mb-1">방 만들기 또는 입장하기</h4>
                  <p className="text-gray-600 text-sm">
                    새 방을 만들거나 친구가 공유한 6자리 코드로 입장하세요.
                  </p>
                </div>
              </li>

              <li className="flex gap-4">
                <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                  2
                </span>
                <div>
                  <h4 className="font-semibold mb-1">프로필 설정</h4>
                  <p className="text-gray-600 text-sm">
                    이름과 색상을 선택하여 나만의 프로필을 만드세요.
                  </p>
                </div>
              </li>

              <li className="flex gap-4">
                <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                  3
                </span>
                <div>
                  <h4 className="font-semibold mb-1">비는 시간 선택</h4>
                  <p className="text-gray-600 text-sm">
                    캘린더에서 가능한 날짜와 시간을 선택하세요.
                    1시간 단위, 범위 선택, 하루 종일 선택 모두 가능합니다.
                  </p>
                </div>
              </li>

              <li className="flex gap-4">
                <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                  4
                </span>
                <div>
                  <h4 className="font-semibold mb-1">최적 시간 확인</h4>
                  <p className="text-gray-600 text-sm">
                    "약속 잡기" 버튼을 눌러 모두가 가능한 시간을 확인하세요.
                  </p>
                </div>
              </li>
            </ol>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-6">기술 스택</h2>
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3">Frontend</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• React 19</li>
                    <li>• Next.js 16</li>
                    <li>• Tailwind CSS 3</li>
                    <li>• shadcn/ui</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-3">Backend</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Supabase (PostgreSQL)</li>
                    <li>• Realtime 동기화</li>
                    <li>• Vercel 호스팅</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-6">연락처</h2>
            <div className="bg-blue-50 rounded-lg p-6">
              <p className="mb-4">
                서비스에 대한 문의사항이나 피드백이 있으시면 언제든지 연락주세요.
              </p>
              <div className="space-y-2">
                <p className="flex items-center gap-2">
                  <span className="font-semibold">이메일:</span>
                  <a href="mailto:contact@swwm.com" className="text-blue-600 hover:underline">
                    contact@swwm.com
                  </a>
                </p>
                <p className="flex items-center gap-2">
                  <span className="font-semibold">GitHub:</span>
                  <a href="https://github.com/jmjj0224/swwm" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    github.com/jmjj0224/swwm
                  </a>
                </p>
              </div>
            </div>
          </section>
        </article>

        {/* 광고 */}
        <AdBanner slot="about-bottom" />
      </div>
    </div>
  )
}
