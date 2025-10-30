/**
 * 사용자 ID를 가져오는 유틸리티 함수
 * 개발 모드일 때는 더미 userId를 반환
 */

import { auth } from '@clerk/nextjs/server'
import { isDevMode, DEV_USER_ID } from './dev-auth'

export async function getUserId(): Promise<string | null> {
  if (isDevMode()) {
    return DEV_USER_ID
  }

  const { userId } = await auth()
  return userId
}

/**
 * 사용자 ID를 가져오고, 없으면 에러를 throw
 */
export async function requireUserId(): Promise<string> {
  const userId = await getUserId()

  if (!userId) {
    throw new Error('Unauthorized')
  }

  return userId
}
