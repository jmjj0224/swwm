import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AdBanner } from '@/components/ads/ad-banner'
import { Home, Users, Calendar, Clock, CheckCircle, Share2 } from 'lucide-react'

export const metadata: Metadata = {
  title: '사용 가이드 - SWWM 약속 캘린더',
  description: 'SWWM 약속 캘린더 사용 방법을 알려드립니다. 방 만들기부터 최적 시간 찾기까지 쉽게 따라해보세요.',
  keywords: ['사용법', '가이드', '약속 잡기', '캘린더 사용법', 'SWWM 튜토리얼'],
}

export default function GuidePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container max-w-4xl mx-auto px-4 py-12">
        {/* 헤더 */}
        <div className="text-center mb-12">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <Home className="h-4 w-4 mr-2" />
              홈으로
            </Button>
          </Link>
          <h1 className="text-4xl font-bold mb-4">📖 SWWM 사용 가이드</h1>
          <p className="text-lg text-gray-600">
            친구들과 약속 시간을 쉽게 정하는 방법을 알려드립니다
          </p>
        </div>

        {/* 소개 섹션 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-6 w-6 text-blue-600" />
              SWWM이란?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-700 leading-relaxed">
            <p>
              <strong>SWWM(Select When We Meet)</strong>은 여러 명이 함께 약속을 잡을 때
              각자의 가능한 시간을 공유하고, 모두가 가능한 최적의 시간을 자동으로 찾아주는
              무료 온라인 캘린더 서비스입니다.
            </p>
            <p>
              단체 채팅방에서 "언제 만날까요?" "나는 이 시간 괜찮아요" 같은 대화를
              주고받느라 시간을 낭비하지 마세요. SWWM을 사용하면 30초 만에
              모두가 가능한 시간을 찾을 수 있습니다.
            </p>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="font-semibold text-blue-900">✨ 핵심 기능</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>간편한 방 생성 (6자리 코드)</li>
                <li>실시간 일정 공유 (모든 참여자 동시 확인)</li>
                <li>자동 최적 시간 계산 (겹치는 시간 강조)</li>
                <li>그룹별 필터링 (팀, 파트별 조회)</li>
                <li>모바일 최적화 (터치 제스처 지원)</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* 광고 */}
        <AdBanner />

        {/* 사용 방법 */}
        <div className="space-y-6 mb-8">
          <h2 className="text-3xl font-bold text-center mb-8">🚀 사용 방법</h2>

          {/* Step 1 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-bold">
                  1
                </span>
                방 만들기
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-gray-700">
              <p>
                SWWM 홈페이지에 접속하여 <strong>"방 만들기"</strong> 버튼을 클릭하세요.
                자동으로 6자리 영문+숫자 코드가 생성됩니다.
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm font-mono font-bold text-center text-2xl">
                  예시: AH5AHQ
                </p>
              </div>
              <p>
                💡 <strong>팁:</strong> 비밀번호를 설정하면 초대받은 사람만 입장할 수 있어요.
                설정 버튼(⚙️)을 눌러 나중에 비밀번호를 추가하거나 변경할 수 있습니다.
              </p>
            </CardContent>
          </Card>

          {/* Step 2 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-bold">
                  2
                </span>
                친구 초대하기
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-gray-700">
              <p>
                생성된 방 코드를 복사하여 단체 채팅방에 공유하세요.
                또는 <strong>"방 공유하기"</strong> 버튼을 눌러 링크를 복사할 수 있습니다.
              </p>
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <p className="text-sm">
                  <Share2 className="inline h-4 w-4 mr-1" />
                  <strong>공유 메시지 예시:</strong>
                </p>
                <p className="text-sm font-mono bg-white p-2 rounded border">
                  "이번 모임 날짜 정하자! SWWM에서 가능한 시간 입력해줘~<br />
                  링크: https://swwm.kr/room/AH5AHQ"
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Step 3 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-bold">
                  3
                </span>
                프로필 설정
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-gray-700">
              <p>
                방에 입장하면 이름과 색상을 선택하는 화면이 나타납니다.
                본인의 이름을 입력하고 원하는 색상을 골라주세요.
              </p>
              <p>
                그룹 태그를 설정하면 팀별로 필터링할 수 있어요.
                예를 들어 "디자인팀", "개발팀", "보컬", "댄서" 같은 그룹을 만들 수 있습니다.
              </p>
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <p className="text-sm">
                  ⚠️ <strong>주의:</strong> 한 사람이 여러 프로필을 만들 수 있어요.
                  친구가 일정을 못 올렸다면 대신 입력해줄 수도 있습니다!
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Step 4 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-bold">
                  4
                </span>
                가능한 시간 선택
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-gray-700">
              <p>
                캘린더에서 날짜를 클릭하면 시간 선택 창이 열립니다.
                가능한 시간을 선택하는 3가지 방법이 있습니다:
              </p>
              <div className="space-y-3">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="font-semibold mb-2">
                    <Calendar className="inline h-4 w-4 mr-1" />
                    방법 1: 한 시간씩 선택
                  </p>
                  <p className="text-sm">
                    "오후 2시", "오후 3시" 같은 시간대를 탭해서 선택하세요.
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="font-semibold mb-2">
                    <Clock className="inline h-4 w-4 mr-1" />
                    방법 2: 범위 선택 (드래그)
                  </p>
                  <p className="text-sm">
                    시작 시간을 길게 누른 후 끝 시간까지 드래그하면
                    여러 시간을 한 번에 선택할 수 있어요.
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="font-semibold mb-2">
                    <CheckCircle className="inline h-4 w-4 mr-1" />
                    방법 3: 하루 종일 가능
                  </p>
                  <p className="text-sm">
                    "하루 종일 가능" 버튼을 누르면 그날 모든 시간이 선택됩니다.
                  </p>
                </div>
              </div>
              <p className="bg-blue-50 p-3 rounded-lg text-sm">
                💡 <strong>실시간 동기화:</strong> 내가 선택한 시간은 즉시 다른 사람에게도 표시되어요!
              </p>
            </CardContent>
          </Card>

          {/* Step 5 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-bold">
                  5
                </span>
                최적 시간 확인 및 확정
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-gray-700">
              <p>
                모든 사람이 시간을 선택하면 하단의 <strong>"약속 잡기"</strong> 버튼을 눌러
                최적의 시간을 확인하세요.
              </p>
              <p>
                겹치는 시간이 많을수록 높은 순위로 표시되며,
                모든 사람이 가능한 시간은 <span className="bg-yellow-200 px-2 py-1 rounded">노란색</span>으로 강조됩니다.
              </p>
              <p>
                원하는 시간을 선택하고 <strong>"확정하기"</strong> 버튼을 누르면
                약속이 확정되고 모든 참여자에게 알림이 갑니다.
                확정할 때 만날 장소와 메모를 추가할 수 있어요.
              </p>
              <div className="bg-green-50 border-l-4 border-green-400 p-4">
                <p className="text-sm">
                  ✅ 확정 후에는 시간 선택을 수정할 수 없으니 신중하게 결정하세요!
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 광고 */}
        <AdBanner />

        {/* 자주 묻는 질문 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>❓ 자주 묻는 질문 (FAQ)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold text-lg mb-2">Q. 방은 언제까지 유지되나요?</h3>
              <p className="text-gray-700">
                A. 방은 생성 후 7일간 유지됩니다. 7일이 지나면 자동으로 삭제되니
                필요한 정보는 미리 저장해두세요.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Q. 비밀번호를 잊어버렸어요</h3>
              <p className="text-gray-700">
                A. 비밀번호는 방을 만든 사람(방장)만 변경하거나 제거할 수 있습니다.
                방장에게 연락하여 비밀번호를 확인하거나 제거를 요청하세요.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Q. 프로필을 여러 개 만들 수 있나요?</h3>
              <p className="text-gray-700">
                A. 네! 한 사람이 여러 프로필을 만들 수 있어요. 우측 상단의 "+" 버튼으로
                새 프로필을 추가하고, 프로필 버튼을 눌러 전환할 수 있습니다.
                친구의 일정을 대신 입력할 때 유용합니다.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Q. 그룹 필터는 어떻게 사용하나요?</h3>
              <p className="text-gray-700">
                A. 프로필 설정에서 그룹 태그를 지정하면, 최적 시간 제안에서
                특정 그룹만 필터링하여 볼 수 있습니다. 예를 들어 "디자인팀"만
                모이는 시간을 찾고 싶을 때 유용해요.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Q. 일정을 잘못 입력했어요</h3>
              <p className="text-gray-700">
                A. 우측 상단의 프로필 선택 메뉴에서 "일정삭제" 버튼을 누르면
                해당 프로필의 모든 일정을 삭제할 수 있습니다. 다시 선택하면 됩니다.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Q. PC에서도 사용할 수 있나요?</h3>
              <p className="text-gray-700">
                A. 네! SWWM은 PC, 태블릿, 모바일 모두에서 사용 가능합니다.
                특히 모바일에서 터치 제스처가 최적화되어 있어 편리하게 사용하실 수 있어요.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 팁과 요령 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>💡 꿀팁 모음</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-700">
            <div>
              <h3 className="font-semibold mb-2">🎨 색상으로 구분하기</h3>
              <p>
                각자 다른 색상을 선택하면 캘린더에서 누가 어느 시간에 가능한지
                한눈에 파악할 수 있어요.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">⏰ 여유 시간 확보하기</h3>
              <p>
                정확한 시간보다 30분~1시간 여유 있게 선택하면
                모두가 만족하는 시간을 찾기 쉬워요.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">📸 스크린샷 공유</h3>
              <p>
                최적 시간이 나온 화면을 캡처해서 단체 채팅방에 공유하면
                결정이 더 빨라집니다!
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">🔒 비밀방 활용</h3>
              <p>
                민감한 모임(깜짝 파티 준비, 비밀 회의 등)은 비밀번호를 설정하여
                초대받은 사람만 입장하도록 하세요.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 광고 */}
        <AdBanner />

        {/* 문의 */}
        <Card>
          <CardHeader>
            <CardTitle>📧 문의하기</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-gray-700">
            <p>
              사용 중 문제가 발생하거나 궁금한 점이 있으시면 언제든지 연락주세요.
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="font-semibold">이메일: swwmcontact@gmail.com</p>
              <p className="text-sm text-gray-600 mt-2">
                평일 기준 24시간 내 답변 드리겠습니다.
              </p>
            </div>
            <div className="flex gap-3 mt-4">
              <Link href="/about" className="flex-1">
                <Button variant="outline" className="w-full">
                  소개 페이지
                </Button>
              </Link>
              <Link href="/terms" className="flex-1">
                <Button variant="outline" className="w-full">
                  이용약관
                </Button>
              </Link>
              <Link href="/privacy" className="flex-1">
                <Button variant="outline" className="w-full">
                  개인정보처리방침
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* 하단 네비게이션 */}
        <div className="mt-12 text-center">
          <Link href="/">
            <Button size="lg" className="px-12">
              지금 시작하기
            </Button>
          </Link>
        </div>
      </div>
    </main>
  )
}
