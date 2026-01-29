# 보안 가이드

## 적용된 보안 기능

### 1. 보안 헤더 (Next.js)

`next.config.ts`에 다음 보안 헤더가 설정되어 있습니다:

- **X-Frame-Options: DENY** - iframe 삽입 방지 (Clickjacking 공격 차단)
- **X-Content-Type-Options: nosniff** - MIME 타입 스니핑 방지
- **X-XSS-Protection: 1; mode=block** - XSS 공격 방지
- **Referrer-Policy: strict-origin-when-cross-origin** - 리퍼러 정보 보호
- **Permissions-Policy** - 불필요한 브라우저 권한 차단 (카메라, 마이크, 위치정보)

### 2. 입력 검증 (Zod)

모든 사용자 입력은 Zod 스키마로 검증됩니다:

- **방 코드**: 6자리 영문 대문자 + 숫자
- **사용자 이름**: 1-50자, 특수문자 필터링
- **비밀번호**: 4-100자 (선택적)
- **그룹 이름**: 1-20자
- **위치/메모**: 최대 길이 제한

**검증 파일**: `src/lib/validation/schemas.ts`

### 3. Rate Limiting

기본적인 요청 제한 기능이 구현되어 있습니다:

- IP 기반 제한
- 사용자 ID 기반 제한
- 방 코드 기반 제한

**제한 파일**: `src/lib/security/rate-limit.ts`

⚠️ **참고**: 현재는 in-memory 방식으로 서버리스 환경에서 완벽하지 않습니다. 프로덕션에서는 Upstash Redis 또는 Vercel Edge Config 사용을 권장합니다.

### 4. 비밀번호 보안

- **SHA-256 해시**: 비밀번호는 SHA-256으로 해시되어 저장
- **클라이언트 사이드 해싱**: 평문 비밀번호가 네트워크를 통해 전송되지 않음
- **최소 길이**: 4자 이상 필수

### 5. 데이터베이스 보안 (Supabase)

- **Row Level Security (RLS)**: 모든 테이블에 RLS 정책 적용
- **익명 접근**: 별도 인증 없이 사용 가능하지만 RLS로 보호
- **자동 삭제**: 7일 후 방 데이터 자동 삭제

## 추가 권장 사항

### 프로덕션 환경

1. **Rate Limiting 업그레이드**
   ```bash
   npm install @upstash/ratelimit @upstash/redis
   ```
   - Upstash Redis 사용
   - 환경 변수: `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`

2. **보안 모니터링**
   - Vercel Analytics 활성화
   - Sentry 에러 추적 추가

3. **HTTPS 강제**
   - Vercel은 기본적으로 HTTPS 제공
   - 커스텀 도메인에도 SSL 인증서 자동 적용

### 개발 환경

1. **환경 변수 보호**
   ```bash
   # .env.local (Git에 커밋하지 않음)
   NEXT_PUBLIC_SUPABASE_URL=your-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
   ```

2. **의존성 업데이트**
   ```bash
   npm audit
   npm update
   ```

## 보안 체크리스트

- [x] 보안 헤더 설정
- [x] 입력 검증 (Zod)
- [x] 비밀번호 해싱
- [x] Rate limiting (기본)
- [x] RLS 정책
- [ ] 프로덕션 Rate limiting (Upstash)
- [ ] CSP (Content Security Policy)
- [ ] CORS 정책
- [ ] 에러 추적 (Sentry)

## 취약점 신고

보안 취약점을 발견하신 경우:
- 이메일: swwmcontact@gmail.com
- 제목: [보안] 취약점 신고
- 공개적으로 이슈를 올리지 말고 비공개로 연락 주세요

## 참고 자료

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security](https://nextjs.org/docs/app/building-your-application/configuring/content-security-policy)
- [Supabase Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Vercel Security](https://vercel.com/docs/security/secure-your-application)
