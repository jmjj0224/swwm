import { z } from 'zod'

// 방 코드 검증
export const roomCodeSchema = z
  .string()
  .length(6, '방 코드는 6자리여야 합니다')
  .regex(/^[A-Z0-9]+$/, '방 코드는 영문 대문자와 숫자만 가능합니다')

// 사용자 이름 검증
export const userNameSchema = z
  .string()
  .min(1, '이름을 입력해주세요')
  .max(50, '이름은 50자 이하여야 합니다')
  .trim()

// 색상 검증
export const colorSchema = z
  .string()
  .regex(/^#[0-9A-F]{6}$/i, '올바른 색상 형식이 아닙니다')

// 비밀번호 검증 (선택적)
export const passwordSchema = z
  .string()
  .min(4, '비밀번호는 최소 4자 이상이어야 합니다')
  .max(100, '비밀번호는 100자 이하여야 합니다')
  .optional()

// 그룹 이름 검증
export const groupNameSchema = z
  .string()
  .min(1, '그룹 이름을 입력해주세요')
  .max(20, '그룹 이름은 20자 이하여야 합니다')
  .trim()

// 위치 검증
export const locationSchema = z
  .string()
  .max(100, '위치는 100자 이하여야 합니다')
  .trim()
  .optional()

// 메모 검증
export const memoSchema = z
  .string()
  .max(500, '메모는 500자 이하여야 합니다')
  .trim()
  .optional()

// 날짜 검증
export const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, '올바른 날짜 형식이 아닙니다 (YYYY-MM-DD)')

// 시간 검증
export const timeSchema = z
  .string()
  .regex(/^\d{2}:\d{2}$/, '올바른 시간 형식이 아닙니다 (HH:MM)')
  .optional()

// UUID 검증
export const uuidSchema = z
  .string()
  .uuid('올바른 UUID 형식이 아닙니다')

// 방 생성 입력 검증
export const createRoomInputSchema = z.object({
  code: roomCodeSchema,
  password: passwordSchema,
})

// 사용자 추가 입력 검증
export const addUserInputSchema = z.object({
  roomId: uuidSchema,
  userId: uuidSchema,
  name: userNameSchema,
  color: colorSchema,
  tags: z.array(z.string()).optional(),
})

// 시간 선택 입력 검증
export const selectTimeInputSchema = z.object({
  roomId: uuidSchema,
  userId: uuidSchema,
  date: dateSchema,
  isAllDay: z.boolean().optional(),
  startTime: timeSchema,
  endTime: timeSchema,
})

// 약속 확정 입력 검증
export const confirmationInputSchema = z.object({
  roomId: uuidSchema,
  date: dateSchema,
  startTime: timeSchema,
  endTime: timeSchema,
  isAllDay: z.boolean().optional(),
  participantUserIds: z.array(uuidSchema).min(1, '참여자가 최소 1명 이상이어야 합니다'),
  participantGroupNames: z.array(z.string()).optional(),
  location: locationSchema,
  memo: memoSchema,
})

// 그룹 생성 입력 검증
export const createGroupInputSchema = z.object({
  roomId: uuidSchema,
  name: groupNameSchema,
  color: colorSchema,
})

// Rate limiting용 - 요청 제한
export const rateLimitKeySchema = z.object({
  ip: z.string().optional(),
  identifier: z.string().optional(),
})

// 검증 헬퍼 함수
export function validateInput<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean
  data?: T
  error?: string
} {
  try {
    const validated = schema.parse(data)
    return { success: true, data: validated }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors.map((e) => e.message).join(', '),
      }
    }
    return {
      success: false,
      error: '입력 검증에 실패했습니다',
    }
  }
}

// Safe parse 헬퍼
export function safeValidate<T>(schema: z.ZodSchema<T>, data: unknown) {
  return schema.safeParse(data)
}
