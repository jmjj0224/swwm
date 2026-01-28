-- room_users와 time_selections에 DELETE 정책 추가

-- room_users DELETE 정책 (기존 정책이 있으면 먼저 삭제)
DROP POLICY IF EXISTS "Anyone can delete room_users" ON room_users;
CREATE POLICY "Anyone can delete room_users"
  ON room_users
  FOR DELETE
  USING (true);

-- time_selections DELETE 정책
DROP POLICY IF EXISTS "Anyone can delete time_selections" ON time_selections;
CREATE POLICY "Anyone can delete time_selections"
  ON time_selections
  FOR DELETE
  USING (true);
