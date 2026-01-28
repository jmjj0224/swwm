-- 잘못된 Realtime Broadcast 트리거 제거
-- Supabase는 postgres_changes 리스너를 통해 자동으로 변경사항을 감지합니다.

-- 시간 선택 트리거 제거
DROP TRIGGER IF EXISTS time_selections_broadcast_trigger ON time_selections;
DROP FUNCTION IF EXISTS notify_time_selection_changes();

-- 방 확정 트리거 제거
DROP TRIGGER IF EXISTS rooms_confirmation_broadcast_trigger ON rooms;
DROP FUNCTION IF EXISTS notify_room_confirmation();

-- 주석: Supabase Realtime은 클라이언트에서 다음과 같이 사용합니다:
-- supabase.channel('room:ID').on('postgres_changes', { event: '*', schema: 'public', table: 'time_selections' }, callback)
