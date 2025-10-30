/**
 * 개발 모드 인증 헬퍼
 * API 키 없이 화면 테스트를 위한 더미 인증
 */

const DEV_MODE = process.env.NEXT_PUBLIC_DEV_MODE === 'true'

export const DEV_USER_ID = 'test_merchant_id_1'

/**
 * 개발 모드에서 사용할 더미 auth 함수
 */
export async function getDevAuth() {
  if (DEV_MODE) {
    return {
      userId: DEV_USER_ID,
      sessionId: 'dev-session',
    }
  }
  return {
    userId: null,
    sessionId: null,
  }
}

/**
 * 개발 모드 여부 확인
 */
export function isDevMode(): boolean {
  return DEV_MODE
}
