-- 프리미엄 기능 추가

-- 1. rooms 테이블에 비밀번호 및 프리미엄 컬럼 추가
ALTER TABLE rooms
ADD COLUMN password VARCHAR(100),  -- 비밀번호 (해시 저장)
ADD COLUMN is_premium BOOLEAN DEFAULT TRUE,  -- 베타 기간이므로 기본값 TRUE
ADD COLUMN created_before_paid_launch BOOLEAN DEFAULT TRUE;  -- 유료화 전 생성된 방 (평생 무료)

-- 2. room_users 테이블에 태그/그룹 컬럼 추가
ALTER TABLE room_users
ADD COLUMN tags JSONB DEFAULT '[]'::jsonb;  -- 사용자가 속한 그룹/태그 배열

-- 3. 그룹 정의 테이블 생성 (방장이 그룹을 미리 만들어둠)
CREATE TABLE room_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  name VARCHAR(50) NOT NULL,  -- 그룹명 (예: "1팀", "리듬섹션")
  color VARCHAR(7) NOT NULL,  -- 그룹 색상
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(room_id, name)
);

-- 인덱스
CREATE INDEX idx_room_groups_room_id ON room_groups(room_id);

-- 4. RLS 정책
ALTER TABLE room_groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read room_groups" ON room_groups FOR SELECT USING (true);
CREATE POLICY "Anyone can create room_groups" ON room_groups FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update room_groups" ON room_groups FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete room_groups" ON room_groups FOR DELETE USING (true);

-- 5. 코멘트
COMMENT ON COLUMN rooms.password IS '방 비밀번호 (bcrypt 해시). NULL이면 공개 방';
COMMENT ON COLUMN rooms.is_premium IS '프리미엄 기능 활성화 여부 (베타 기간에는 모두 TRUE)';
COMMENT ON COLUMN rooms.created_before_paid_launch IS '유료화 전 생성된 방 (평생 무료 보장)';
COMMENT ON COLUMN room_users.tags IS '사용자가 속한 그룹/태그 배열 (예: ["1팀", "보컬"])';
