-- 방 비밀번호 및 방장 기능 추가
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS password_hash TEXT;
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS creator_user_id TEXT;

-- 주석 추가
COMMENT ON COLUMN rooms.password_hash IS '방 비밀번호 해시 (SHA-256, 선택적)';
COMMENT ON COLUMN rooms.creator_user_id IS '방을 만든 사용자 ID (방장)';
