# Supabase 설정 가이드

## 1. Supabase 프로젝트 생성

1. [Supabase](https://supabase.com)에 로그인
2. 새 프로젝트 생성
3. Database Password 설정 (안전한 장소에 저장)
4. Region 선택 (추천: ap-northeast-1 - Tokyo)

## 2. 환경 변수 설정

프로젝트 생성 후 Settings > API에서 다음 정보를 복사하여 `.env.local`에 입력:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 3. 데이터베이스 마이그레이션 실행

Supabase Dashboard > SQL Editor에서 다음 순서대로 실행:

1. `migrations/001_create_rooms.sql`
2. `migrations/002_create_room_users.sql`
3. `migrations/003_create_time_selections.sql`
4. `migrations/004_realtime_broadcast.sql`

또는 Supabase CLI 사용:

```bash
# Supabase CLI 설치
npm install -g supabase

# 로그인
supabase login

# 프로젝트 링크
supabase link --project-ref your-project-ref

# 마이그레이션 실행
supabase db push
```

## 4. Realtime 활성화

Supabase Dashboard > Database > Replication에서:
- `rooms` 테이블 활성화
- `room_users` 테이블 활성화
- `time_selections` 테이블 활성화

## 5. 테스트

```bash
# 개발 서버 시작
npm run dev
```

http://localhost:3000에 접속하여 테스트

## 데이터베이스 스키마

### rooms
- 방 정보 저장
- 6자리 코드로 식별
- 7일 후 자동 만료

### room_users
- 방에 참여한 사용자 정보
- 이름, 색상 저장
- 익명 사용자 지원 (user_id는 클라이언트 생성 UUID)

### time_selections
- 사용자의 시간 선택 데이터
- 3가지 방식 지원:
  - 1시간 간격 선택
  - 범위 선택 (start_time ~ end_time)
  - 전체 날짜 선택 (is_all_day = true)

## Realtime 채널

채널 토픽: `room:{room_id}`

### Broadcast 이벤트
- `time_selection_insert`: 시간 선택 추가
- `time_selection_update`: 시간 선택 수정
- `time_selection_delete`: 시간 선택 삭제
- `room_confirmed`: 방 확정

### Presence
- 온라인 사용자 추적
- 사용자 정보 (이름, 색상) 공유
