import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { AdBanner } from '@/components/ads/ad-banner'

export const metadata: Metadata = {
  title: '개인정보처리방침 - SWWM',
  description: 'SWWM 약속 캘린더 개인정보처리방침',
}

export default function PrivacyPage() {
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

        <article className="bg-white rounded-lg shadow-sm p-8 prose prose-blue max-w-none">
          <h1 className="text-3xl font-bold mb-6">개인정보처리방침</h1>

          <p className="text-gray-600 mb-6">
            최종 수정일: {new Date().toLocaleDateString('ko-KR')}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. 개인정보의 수집 및 이용 목적</h2>
            <p className="mb-4">
              SWWM("약속 캘린더")는 다음의 목적을 위하여 개인정보를 처리합니다.
              처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며,
              이용 목적이 변경되는 경우에는 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>서비스 제공 및 운영</li>
              <li>일정 조율 및 공유 기능 제공</li>
              <li>사용자 경험 개선</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. 수집하는 개인정보 항목</h2>
            <p className="mb-4">SWWM는 최소한의 정보만 수집합니다:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>필수 항목:</strong> 사용자 이름 (닉네임)</li>
              <li><strong>자동 수집 항목:</strong> IP 주소, 쿠키, 방문 기록, 서비스 이용 기록</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. 개인정보의 보유 및 이용 기간</h2>
            <p className="mb-4">
              개인정보는 수집 및 이용 목적이 달성되면 지체 없이 파기합니다:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>방 생성 후 7일 경과 시 자동 삭제</li>
              <li>사용자가 직접 삭제한 경우 즉시 파기</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. 제3자 제공</h2>
            <p>
              SWWM는 사용자의 개인정보를 제3자에게 제공하지 않습니다.
              단, 다음의 경우는 예외로 합니다:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li>법령에 의한 경우</li>
              <li>사용자의 사전 동의가 있는 경우</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Google AdSense</h2>
            <p className="mb-4">
              본 웹사이트는 Google AdSense를 사용하여 광고를 게재합니다.
              Google은 쿠키를 사용하여 사용자의 관심사에 기반한 광고를 제공할 수 있습니다.
            </p>
            <p className="mb-4">
              사용자는 <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google 광고 설정</a>에서
              맞춤 광고를 선택 해제할 수 있습니다.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. 사용자의 권리</h2>
            <p className="mb-4">사용자는 다음의 권리를 가집니다:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>개인정보 열람 요구</li>
              <li>개인정보 정정 요구</li>
              <li>개인정보 삭제 요구</li>
              <li>개인정보 처리 정지 요구</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. 개인정보 보호책임자</h2>
            <p className="mb-4">
              개인정보 처리에 관한 업무를 총괄해서 책임지고,
              개인정보 처리와 관련한 정보주체의 불만처리 및 피해구제를 처리하기 위하여
              아래와 같이 개인정보 보호책임자를 지정하고 있습니다.
            </p>
            <div className="bg-gray-50 p-4 rounded">
              <p><strong>개인정보 보호책임자</strong></p>
              <p>이메일: swwmcontact@gmail.com</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. 개인정보처리방침 변경</h2>
            <p>
              이 개인정보처리방침은 시행일로부터 적용되며,
              법령 및 방침에 따른 변경내용의 추가, 삭제 및 정정이 있는 경우에는
              변경사항의 시행 7일 전부터 공지사항을 통하여 고지할 것입니다.
            </p>
          </section>
        </article>

        {/* 광고 */}
        <AdBanner />
      </div>
    </div>
  )
}
