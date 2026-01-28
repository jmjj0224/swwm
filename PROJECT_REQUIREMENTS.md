# SWWM 프로젝트 요구사항

## 프로젝트 개요
밴드 멤버들의 연습 일정을 조율하는 스케줄러 앱

## 핵심 기능

### 1. 방 시스템
- 6자리 영숫자 코드로 방 생성/입장 (예: AB12CD)
- 혼동 방지: I, O, 0, 1 제외
- 방 목록 화면 (홈)
- 코드로 참여 기능

### 2. UI 스타일
- **Apple/iOS 디자인 언어**
- 라이트 테마 (다크 아님)
- 색상:
  - 배경: #F2F2F7 (iOS 그레이)
  - 카드: #FFFFFF
  - Primary: #007AFF (시스템 블루)
  - 텍스트: #000000
  - 강조: #FFD60A (시스템 옐로우)
- 폰트: -apple-system, SF Pro Text
- 둥근 카드 (16px), 터치 타겟 50px

### 3. 약속 확정 기능
- 전체 멤버가 겹치는 시간대 **노란색 표시**
- 모든 멤버가 확정 가능 (민주적)
- 모달 방식으로 확정
  - 제목 입력 (필수)
  - 메모 입력 (자유 텍스트 - 위치, 목적 등)
- 확정된 약속: 노란색 배경 + ⭐️ 표시
- 클릭 시 상세보기/수정/취소 가능

### 4. 실시간 동기화
- Supabase 사용
- 멤버의 시간 선택 실시간 반영
- 약속 확정 실시간 동기화

### 5. AI 분석 (선택)
- Google Gemini API
- 최적의 시간대 추천

## 기술 스택
- React 19 + TypeScript
- Vite
- Tailwind CSS (iOS 디자인 시스템)
- Supabase (실시간 DB)
- Google Gemini API
- Lucide React (아이콘)

## 데이터베이스 스키마

### rooms 테이블
```sql
code TEXT PRIMARY KEY
name TEXT NOT NULL
created_by TEXT NOT NULL
created_at TIMESTAMP DEFAULT NOW()
```

### availability 테이블
```sql
id TEXT PRIMARY KEY (user_id)
room_code TEXT REFERENCES rooms(code)
user_name TEXT
user_info JSONB
selected_slots TEXT[]
updated_at TIMESTAMP
```

### confirmed_events 테이블
```sql
id UUID PRIMARY KEY
room_code TEXT REFERENCES rooms(code)
date DATE
start_hour INTEGER
end_hour INTEGER
title TEXT NOT NULL
memo TEXT
confirmed_by TEXT
confirmed_at TIMESTAMP
updated_at TIMESTAMP
updated_by TEXT
```

## 주요 화면

1. **홈 (방 목록)**
   - 참여한 방 카드 리스트
   - "새 방 만들기" 버튼
   - "코드로 참여" 버튼

2. **방 생성 모달**
   - 방 이름 입력
   - 자동 생성된 코드 표시
   - 프로필 설정 (이름, 역할, 색상)

3. **방 참여 모달**
   - 6자리 코드 입력
   - 실시간 검증
   - 프로필 설정

4. **캘린더 화면**
   - 월간 캘린더
   - 겹친 시간대 노란색 테두리
   - 확정 약속 노란색 배경 + ⭐️

5. **약속 확정 모달**
   - 날짜/시간 자동 표시
   - 제목 입력
   - 메모 입력

6. **약속 상세 모달**
   - 정보 표시
   - 수정 버튼
   - 취소 버튼

