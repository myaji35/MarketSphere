import admin from 'firebase-admin'

/**
 * Firebase Admin SDK 초기화
 * 개발 모드에서는 에러를 무시하고 더미 응답 반환
 */
function initializeFirebaseAdmin() {
  if (admin.apps.length > 0) {
    return admin.apps[0]
  }

  try {
    // 프로덕션 환경에서는 환경 변수로 Firebase 설정
    const projectId = process.env.FIREBASE_PROJECT_ID
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')

    if (projectId && clientEmail && privateKey) {
      return admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      })
    }

    console.warn('⚠️  Firebase credentials not configured. Push notifications will be mocked.')
    return null
  } catch (error) {
    console.error('Firebase Admin SDK initialization failed:', error)
    return null
  }
}

// Firebase Admin SDK 초기화
const firebaseApp = initializeFirebaseAdmin()

export interface PushNotificationInput {
  tokens: string[]
  title: string
  body: string
  data?: Record<string, string>
  imageUrl?: string
}

export interface PushNotificationResult {
  successCount: number
  failureCount: number
  invalidTokens: string[]
}

/**
 * FCM을 통해 푸시 알림 발송
 * @param input - 푸시 알림 입력 데이터
 * @returns 발송 결과
 */
export async function sendPushNotification(
  input: PushNotificationInput
): Promise<PushNotificationResult> {
  // 개발 모드: Firebase 미설정 시 더미 응답
  if (!firebaseApp || process.env.NODE_ENV === 'development') {
    console.log('📱 [DEV MODE] Push notification mock:', {
      tokens: input.tokens.length,
      title: input.title,
      body: input.body,
      data: input.data,
    })

    return {
      successCount: input.tokens.length,
      failureCount: 0,
      invalidTokens: [],
    }
  }

  try {
    // 토큰이 없으면 즉시 반환
    if (input.tokens.length === 0) {
      return {
        successCount: 0,
        failureCount: 0,
        invalidTokens: [],
      }
    }

    // FCM 메시지 구성
    const message: admin.messaging.MulticastMessage = {
      notification: {
        title: input.title,
        body: input.body,
        ...(input.imageUrl && { imageUrl: input.imageUrl }),
      },
      data: input.data,
      tokens: input.tokens,
      // Android 우선순위 설정
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
          channelId: 'timesale',
        },
      },
      // iOS 우선순위 설정
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1,
          },
        },
      },
    }

    // FCM API 호출
    const response = await admin.messaging().sendEachForMulticast(message)

    // 실패한 토큰 추출 (만료되었거나 잘못된 토큰)
    const invalidTokens: string[] = []
    response.responses.forEach((resp, idx) => {
      if (!resp.success) {
        invalidTokens.push(input.tokens[idx])
        console.error(`Failed to send to token ${input.tokens[idx]}:`, resp.error)
      }
    })

    console.log(`✅ 푸시 발송 성공: ${response.successCount}/${input.tokens.length}`)

    return {
      successCount: response.successCount,
      failureCount: response.failureCount,
      invalidTokens,
    }
  } catch (error) {
    console.error('❌ 푸시 발송 실패:', error)
    throw error
  }
}

/**
 * 타임세일 푸시 알림 발송
 * @param storeId - 상점 ID
 * @param storeName - 상점명
 * @param title - 타임세일 제목
 * @param discountRate - 할인율
 * @param endTime - 종료 시간
 * @param tokens - 푸시 토큰 배열
 */
export async function sendTimeSalePushNotification(params: {
  storeId: string
  storeName: string
  title: string
  discountRate: number
  endTime: Date
  tokens: string[]
}): Promise<PushNotificationResult> {
  const { storeId, storeName, title, discountRate, endTime, tokens } = params

  // 종료까지 남은 시간 계산
  const now = new Date()
  const diffInMinutes = Math.floor((endTime.getTime() - now.getTime()) / (1000 * 60))
  const timeLeft =
    diffInMinutes >= 120
      ? `${Math.floor(diffInMinutes / 60)}시간`
      : diffInMinutes >= 60
        ? `${Math.floor(diffInMinutes / 60)}시간 ${diffInMinutes % 60}분`
        : `${diffInMinutes}분`

  return sendPushNotification({
    tokens,
    title: `🔥 [${storeName}] 긴급 타임세일!`,
    body: `${title} - 지금 방문하시면 ${discountRate}% 할인! (${timeLeft}만 남았어요)`,
    data: {
      type: 'timesale',
      storeId,
      screen: 'StoreDetail',
    },
  })
}

/**
 * 잘못된 푸시 토큰을 DB에서 삭제
 * @param invalidTokens - 삭제할 토큰 배열
 */
export async function removeInvalidPushTokens(invalidTokens: string[]): Promise<void> {
  if (invalidTokens.length === 0) return

  try {
    const { prisma } = await import('@/lib/prisma')
    await prisma.pushToken.deleteMany({
      where: {
        token: {
          in: invalidTokens,
        },
      },
    })
    console.log(`🗑️  Removed ${invalidTokens.length} invalid push tokens`)
  } catch (error) {
    console.error('Failed to remove invalid push tokens:', error)
  }
}
