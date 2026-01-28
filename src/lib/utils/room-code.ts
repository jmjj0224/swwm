/**
 * 6자리 영문+숫자 코드 생성
 * 혼동 방지를 위해 I, O, 0, 1 제외
 */
const SAFE_CHARS = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'

export function generateRoomCode(): string {
  let code = ''
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * SAFE_CHARS.length)
    code += SAFE_CHARS[randomIndex]
  }
  return code
}

export function validateRoomCode(code: string): boolean {
  if (code.length !== 6) return false

  const regex = /^[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{6}$/
  return regex.test(code.toUpperCase())
}
