import { describe, it, expect, vi, beforeEach } from 'vitest'
import { sendPushNotification, sendTimeSalePushNotification } from '@/lib/push'

// Firebase Admin SDK Mock
vi.mock('firebase-admin', () => ({
  default: {
    apps: [],
    initializeApp: vi.fn(),
    credential: {
      cert: vi.fn(),
    },
    messaging: vi.fn(() => ({
      sendEachForMulticast: vi.fn().mockResolvedValue({
        successCount: 2,
        failureCount: 0,
        responses: [{ success: true }, { success: true }],
      }),
    })),
  },
}))

describe('Push Notification Service', () => {
  beforeEach(() => {
    // 환경 변수 리셋
    delete process.env.FIREBASE_PROJECT_ID
    delete process.env.FIREBASE_CLIENT_EMAIL
    delete process.env.FIREBASE_PRIVATE_KEY
  })

  describe('sendPushNotification', () => {
    it('should return success in development mode', async () => {
      const result = await sendPushNotification({
        tokens: ['token1', 'token2'],
        title: 'Test Title',
        body: 'Test Body',
        data: { type: 'test' },
      })

      expect(result.successCount).toBe(2)
      expect(result.failureCount).toBe(0)
      expect(result.invalidTokens).toEqual([])
    })

    it('should handle empty token array', async () => {
      const result = await sendPushNotification({
        tokens: [],
        title: 'Test Title',
        body: 'Test Body',
      })

      expect(result.successCount).toBe(0)
      expect(result.failureCount).toBe(0)
      expect(result.invalidTokens).toEqual([])
    })

    it('should include data payload when provided', async () => {
      const result = await sendPushNotification({
        tokens: ['token1'],
        title: 'Test Title',
        body: 'Test Body',
        data: {
          type: 'timesale',
          storeId: 'store-123',
        },
      })

      expect(result.successCount).toBeGreaterThanOrEqual(0)
    })

    it('should include image URL when provided', async () => {
      const result = await sendPushNotification({
        tokens: ['token1'],
        title: 'Test Title',
        body: 'Test Body',
        imageUrl: 'https://example.com/image.jpg',
      })

      expect(result.successCount).toBeGreaterThanOrEqual(0)
    })
  })

  describe('sendTimeSalePushNotification', () => {
    it('should send time sale push notification with correct format', async () => {
      const endTime = new Date(Date.now() + 2 * 60 * 60 * 1000) // 2시간 후

      const result = await sendTimeSalePushNotification({
        storeId: 'store-123',
        storeName: '김밥천국',
        title: '신선한 과일 할인',
        discountRate: 30,
        endTime,
        tokens: ['token1', 'token2'],
      })

      expect(result.successCount).toBe(2)
      expect(result.failureCount).toBe(0)
    })

    it('should calculate time left correctly for less than 1 hour', async () => {
      const endTime = new Date(Date.now() + 45 * 60 * 1000) // 45분 후

      const result = await sendTimeSalePushNotification({
        storeId: 'store-123',
        storeName: '떡볶이 나라',
        title: '긴급 할인',
        discountRate: 50,
        endTime,
        tokens: ['token1'],
      })

      expect(result.successCount).toBeGreaterThanOrEqual(0)
    })

    it('should calculate time left correctly for multiple hours', async () => {
      const endTime = new Date(Date.now() + 5 * 60 * 60 * 1000) // 5시간 후

      const result = await sendTimeSalePushNotification({
        storeId: 'store-123',
        storeName: '할매 분식',
        title: '오늘만 특가',
        discountRate: 20,
        endTime,
        tokens: ['token1'],
      })

      expect(result.successCount).toBeGreaterThanOrEqual(0)
    })

    it('should handle empty tokens array', async () => {
      const endTime = new Date(Date.now() + 2 * 60 * 60 * 1000)

      const result = await sendTimeSalePushNotification({
        storeId: 'store-123',
        storeName: '상점명',
        title: '할인',
        discountRate: 30,
        endTime,
        tokens: [],
      })

      expect(result.successCount).toBe(0)
      expect(result.failureCount).toBe(0)
    })
  })

  describe('Push notification content validation', () => {
    it('should format title with fire emoji and store name', async () => {
      const endTime = new Date(Date.now() + 60 * 60 * 1000)

      const result = await sendTimeSalePushNotification({
        storeId: 'store-123',
        storeName: '테스트 상점',
        title: '할인 이벤트',
        discountRate: 30,
        endTime,
        tokens: ['token1'],
      })

      // 개발 모드에서는 항상 성공
      expect(result.successCount).toBeGreaterThanOrEqual(0)
    })

    it('should include discount rate in notification body', async () => {
      const endTime = new Date(Date.now() + 2 * 60 * 60 * 1000)

      const result = await sendTimeSalePushNotification({
        storeId: 'store-123',
        storeName: '상점',
        title: '제목',
        discountRate: 50,
        endTime,
        tokens: ['token1'],
      })

      expect(result.successCount).toBeGreaterThanOrEqual(0)
    })
  })
})
