-- 약속 확정 테이블 생성

CREATE TABLE confirmations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,

  -- 확정된 시간
  date DATE NOT NULL,
  start_time TIME,  -- NULL이면 하루 종일
  end_time TIME,
  is_all_day BOOLEAN DEFAULT FALSE,

  -- 참여자 정보
  participant_user_ids TEXT[] NOT NULL,  -- 참여자 user_id 배열
  participant_group_names TEXT[],  -- 참여 그룹명 배열 (선택)

  -- 추가 정보
  location TEXT,
  memo TEXT,

  confirmed_at TIMESTAMPTZ DEFAULT NOW(),

  -- 하나의 방에서 같은 시간에 여러 확정이 있을 수 있음 (그룹별로)
  UNIQUE(room_id, date, start_time, end_time)
);

-- 인덱스
CREATE INDEX idx_confirmations_room_id ON confirmations(room_id);
CREATE INDEX idx_confirmations_date ON confirmations(room_id, date);

-- RLS 정책
ALTER TABLE confirmations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read confirmations" ON confirmations FOR SELECT USING (true);
CREATE POLICY "Anyone can create confirmations" ON confirmations FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update confirmations" ON confirmations FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete confirmations" ON confirmations FOR DELETE USING (true);

-- 코멘트
COMMENT ON TABLE confirmations IS '확정된 약속 목록. 같은 시간대에 다른 그룹이 각각 확정 가능';
COMMENT ON COLUMN confirmations.participant_user_ids IS '이 약속에 참여하는 사용자 ID 배열';
COMMENT ON COLUMN confirmations.participant_group_names IS '이 약속에 참여하는 그룹명 배열 (그룹 필터 사용 시)';
