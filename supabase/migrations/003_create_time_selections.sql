-- time_selections 테이블 생성
CREATE TABLE IF NOT EXISTS time_selections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,

  -- 시간 선택 데이터
  date DATE NOT NULL,
  is_all_day BOOLEAN DEFAULT FALSE,
  start_time TIME,
  end_time TIME,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 중복 방지: 같은 사용자가 같은 날짜에 중복 시간 선택 불가
-- (단, is_all_day일 경우 start_time은 null이므로 중복 가능)
CREATE UNIQUE INDEX idx_time_selections_unique
  ON time_selections(room_id, user_id, date, start_time)
  WHERE start_time IS NOT NULL;

-- 인덱스 생성
CREATE INDEX idx_time_selections_room_id ON time_selections(room_id);
CREATE INDEX idx_time_selections_date ON time_selections(room_id, date);
CREATE INDEX idx_time_selections_user_id ON time_selections(room_id, user_id);

-- RLS 활성화
ALTER TABLE time_selections ENABLE ROW LEVEL SECURITY;

-- RLS 정책: 읽기 (모든 사용자)
CREATE POLICY "Anyone can read time_selections"
  ON time_selections
  FOR SELECT
  USING (true);

-- RLS 정책: 생성/수정/삭제 (모든 사용자)
CREATE POLICY "Anyone can manage time_selections"
  ON time_selections
  FOR ALL
  USING (true);

-- 자동 업데이트 트리거 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- updated_at 자동 업데이트 트리거
CREATE TRIGGER update_time_selections_updated_at
  BEFORE UPDATE ON time_selections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 주석 추가
COMMENT ON TABLE time_selections IS '사용자의 시간 선택 데이터';
COMMENT ON COLUMN time_selections.is_all_day IS 'true면 하루 종일 가능 (start_time, end_time은 null)';
COMMENT ON COLUMN time_selections.start_time IS '시작 시간 (예: 09:00)';
COMMENT ON COLUMN time_selections.end_time IS '종료 시간 (예: 10:00)';
