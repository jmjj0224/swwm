import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { AdBanner } from '@/components/ads/ad-banner'

export const metadata: Metadata = {
  title: '이용약관 - SWWM',
  description: 'SWWM 약속 캘린더 이용약관',
}

export default function TermsPage() {
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
          <h1 className="text-3xl font-bold mb-6">이용약관</h1>

          <p className="text-gray-600 mb-6">
            최종 수정일: {new Date().toLocaleDateString('ko-KR')}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">제1조 (목적)</h2>
            <p>
              이 약관은 SWWM("약속 캘린더", 이하 "서비스")이 제공하는
              일정 조율 및 공유 서비스의 이용과 관련하여
              서비스와 이용자의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">제2조 (정의)</h2>
            <ol className="list-decimal pl-6 space-y-2">
              <li>
                <strong>"서비스"</strong>란 SWWM가 제공하는 온라인 일정 조율 및 공유 플랫폼을 의미합니다.
              </li>
              <li>
                <strong>"이용자"</strong>란 본 약관에 따라 서비스를 이용하는 모든 사용자를 의미합니다.
              </li>
              <li>
                <strong>"방"</strong>이란 여러 이용자가 일정을 공유하고 조율하는 공간을 의미합니다.
              </li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">제3조 (약관의 효력 및 변경)</h2>
            <ol className="list-decimal pl-6 space-y-3">
              <li>
                본 약관은 서비스를 이용하고자 하는 모든 이용자에 대하여 그 효력을 발생합니다.
              </li>
              <li>
                서비스는 필요한 경우 관련 법령을 위배하지 않는 범위에서 본 약관을 변경할 수 있습니다.
              </li>
              <li>
                약관이 변경되는 경우, 변경사항을 시행일자 7일 전부터 공지합니다.
              </li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">제4조 (서비스의 제공)</h2>
            <p className="mb-4">서비스는 다음과 같은 기능을 제공합니다:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>일정 공유 방 생성 및 참여</li>
              <li>개인 일정 입력 및 수정</li>
              <li>여러 사용자의 일정 실시간 동기화</li>
              <li>최적의 약속 시간 자동 계산 및 제안</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">제5조 (이용자의 의무)</h2>
            <p className="mb-4">이용자는 다음 행위를 하여서는 안 됩니다:</p>
            <ol className="list-decimal pl-6 space-y-2">
              <li>타인의 정보 도용</li>
              <li>서비스의 정상적인 운영을 방해하는 행위</li>
              <li>불법적이거나 부적절한 내용의 정보 입력</li>
              <li>서비스의 취약점을 악용하는 행위</li>
              <li>서비스를 상업적 목적으로 무단 이용하는 행위</li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">제6조 (서비스의 중단)</h2>
            <p>
              서비스는 다음의 경우 서비스 제공을 중단할 수 있습니다:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li>서비스 설비의 보수 또는 점검</li>
              <li>전기통신사업법에 규정된 기간통신사업자가 서비스를 중지했을 때</li>
              <li>국가비상사태, 정전, 서비스 설비의 장애 등 불가항력적 사유</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">제7조 (데이터의 보관 및 삭제)</h2>
            <ol className="list-decimal pl-6 space-y-3">
              <li>
                방 생성 후 7일이 경과하면 자동으로 삭제됩니다.
              </li>
              <li>
                이용자는 언제든지 자신의 데이터를 삭제할 수 있습니다.
              </li>
              <li>
                삭제된 데이터는 복구할 수 없습니다.
              </li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">제8조 (면책조항)</h2>
            <ol className="list-decimal pl-6 space-y-3">
              <li>
                서비스는 천재지변 또는 이에 준하는 불가항력으로 인하여
                서비스를 제공할 수 없는 경우에는 책임이 면제됩니다.
              </li>
              <li>
                서비스는 이용자의 귀책사유로 인한 서비스 이용의 장애에 대하여 책임을 지지 않습니다.
              </li>
              <li>
                서비스는 이용자가 서비스를 이용하여 기대하는 수익을 얻지 못하거나
                상실한 것에 대하여 책임을 지지 않습니다.
              </li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">제9조 (준거법 및 관할법원)</h2>
            <ol className="list-decimal pl-6 space-y-3">
              <li>
                서비스와 이용자 간 발생한 분쟁에 관한 소송은 대한민국 법률을 준거법으로 합니다.
              </li>
              <li>
                분쟁 해결을 위한 소송은 민사소송법상의 관할법원에 제기합니다.
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">부칙</h2>
            <p>본 약관은 {new Date().toLocaleDateString('ko-KR')}부터 시행됩니다.</p>
          </section>
        </article>

        {/* 광고 */}
        <AdBanner />
      </div>
    </div>
  )
}
