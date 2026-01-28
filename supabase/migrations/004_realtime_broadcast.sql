-- Realtime Broadcast 트리거 생성
-- 시간 선택 변경 시 자동으로 해당 방 채널에 브로드캐스트

CREATE OR REPLACE FUNCTION notify_time_selection_changes()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM realtime.broadcast_changes(
    'room:' || COALESCE(NEW.room_id, OLD.room_id)::text,
    TG_OP,
    'time_selection_' || LOWER(TG_OP),
    TG_TABLE_NAME,
    TG_TABLE_SCHEMA,
    NEW,
    OLD
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 시간 선택 테이블에 트리거 연결
CREATE TRIGGER time_selections_broadcast_trigger
  AFTER INSERT OR UPDATE OR DELETE ON time_selections
  FOR EACH ROW EXECUTE FUNCTION notify_time_selection_changes();

-- 방 확정 변경 시 브로드캐스트
CREATE OR REPLACE FUNCTION notify_room_confirmation()
RETURNS TRIGGER AS $$
BEGIN
  -- 확정 상태가 변경되었을 때만 브로드캐스트
  IF NEW.is_confirmed != OLD.is_confirmed THEN
    PERFORM realtime.broadcast_changes(
      'room:' || NEW.id::text,
      TG_OP,
      'room_confirmed',
      TG_TABLE_NAME,
      TG_TABLE_SCHEMA,
      NEW,
      OLD
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 방 테이블에 트리거 연결
CREATE TRIGGER rooms_confirmation_broadcast_trigger
  AFTER UPDATE ON rooms
  FOR EACH ROW EXECUTE FUNCTION notify_room_confirmation();

-- 주석 추가
COMMENT ON FUNCTION notify_time_selection_changes() IS '시간 선택 변경을 Realtime으로 브로드캐스트';
COMMENT ON FUNCTION notify_room_confirmation() IS '방 확정 변경을 Realtime으로 브로드캐스트';
