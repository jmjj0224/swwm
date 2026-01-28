-- room_users 테이블 생성
CREATE TABLE IF NOT EXISTS room_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  name VARCHAR(50) NOT NULL,
  color VARCHAR(7) NOT NULL,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(room_id, user_id)
);

-- 인덱스 생성
CREATE INDEX idx_room_users_room_id ON room_users(room_id);
CREATE INDEX idx_room_users_user_id ON room_users(user_id);

-- RLS 활성화
ALTER TABLE room_users ENABLE ROW LEVEL SECURITY;

-- RLS 정책: 읽기 (모든 사용자)
CREATE POLICY "Anyone can read room_users"
  ON room_users
  FOR SELECT
  USING (true);

-- RLS 정책: 생성 (모든 사용자 - 방 참여)
CREATE POLICY "Anyone can join rooms"
  ON room_users
  FOR INSERT
  WITH CHECK (true);

-- RLS 정책: 업데이트 (모든 사용자 - last_seen_at 업데이트)
CREATE POLICY "Anyone can update room_users"
  ON room_users
  FOR UPDATE
  USING (true);

-- 주석 추가
COMMENT ON TABLE room_users IS '방에 참여한 사용자 정보';
COMMENT ON COLUMN room_users.user_id IS '클라이언트 생성 UUID (익명)';
COMMENT ON COLUMN room_users.color IS 'HEX 색상 코드 (예: #FF3B30)';
