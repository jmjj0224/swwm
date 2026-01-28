-- rooms 테이블 생성
CREATE TABLE IF NOT EXISTS rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(6) UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '7 days',
  is_confirmed BOOLEAN DEFAULT FALSE,
  confirmation_date TIMESTAMPTZ,
  confirmation_location TEXT,
  confirmation_memo TEXT
);

-- 인덱스 생성
CREATE INDEX idx_rooms_code ON rooms(code);
CREATE INDEX idx_rooms_expires_at ON rooms(expires_at);

-- RLS 활성화
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;

-- RLS 정책: 읽기 (모든 사용자)
CREATE POLICY "Anyone can read rooms"
  ON rooms
  FOR SELECT
  USING (true);

-- RLS 정책: 생성 (모든 사용자)
CREATE POLICY "Anyone can create rooms"
  ON rooms
  FOR INSERT
  WITH CHECK (true);

-- RLS 정책: 업데이트 (모든 사용자 - 확정 기능)
CREATE POLICY "Anyone can update rooms"
  ON rooms
  FOR UPDATE
  USING (true);

-- 주석 추가
COMMENT ON TABLE rooms IS '약속 방 정보를 저장하는 테이블';
COMMENT ON COLUMN rooms.code IS '6자리 영문+숫자 고유 코드 (I, O, 0, 1 제외)';
COMMENT ON COLUMN rooms.expires_at IS '방 만료 시간 (생성 후 7일)';
COMMENT ON COLUMN rooms.is_confirmed IS '약속 확정 여부';
