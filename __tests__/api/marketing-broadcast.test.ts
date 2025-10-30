import { describe, it, expect, beforeEach, vi } from 'vitest'
import { POST, GET } from '@/app/api/association/marketing/broadcast/route'
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import * as pushModule from '@/lib/push'

// Mock modules
vi.mock('@/lib/push', () => ({
  sendPushNotification: vi.fn(),
  removeInvalidPushTokens: vi.fn(),
}))

vi.mock('@/lib/prisma', () => ({
  prisma: {
    market: {
      findUnique: vi.fn(),
    },
    favorite: {
      findMany: vi.fn(),
      groupBy: vi.fn(),
    },
    pushToken: {
      findMany: vi.fn(),
    },
    marketingCampaign: {
      create: vi.fn(),
      update: vi.fn(),
      findMany: vi.fn(),
    },
  },
}))

describe('Marketing Broadcast API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('POST /api/association/marketing/broadcast', () => {
    it('should broadcast push notification to all customers', async () => {
      const mockMarket = {
        id: 'market-1',
        marketName: '망원시장',
        totalStores: 50,
      }

      const mockFavorites = [{ userId: 'user-1' }, { userId: 'user-2' }, { userId: 'user-3' }]

      const mockPushTokens = [{ token: 'token-1' }, { token: 'token-2' }, { token: 'token-3' }]

      const mockCampaign = {
        id: 'campaign-1',
        marketId: 'market-1',
        title: '주말 특별 할인',
        message: '모든 상점 20% 할인!',
        targetAudience: 'ALL',
        createdBy: 'dev-association-admin',
        status: 'SENT',
        targetCount: 3,
        successCount: 0,
        failureCount: 0,
        sentAt: new Date(),
      }

      vi.mocked(prisma.market.findUnique).mockResolvedValue(mockMarket as any)
      vi.mocked(prisma.favorite.findMany).mockResolvedValue(mockFavorites as any)
      vi.mocked(prisma.pushToken.findMany).mockResolvedValue(mockPushTokens as any)
      vi.mocked(prisma.marketingCampaign.create).mockResolvedValue(mockCampaign as any)
      vi.mocked(prisma.marketingCampaign.update).mockResolvedValue(mockCampaign as any)

      vi.mocked(pushModule.sendPushNotification).mockResolvedValue({
        successCount: 3,
        failureCount: 0,
        invalidTokens: [],
      })

      const request = new NextRequest('http://localhost:3000/api/association/marketing/broadcast', {
        method: 'POST',
        body: JSON.stringify({
          marketId: 'market-1',
          title: '주말 특별 할인',
          message: '모든 상점 20% 할인!',
          targetAudience: 'ALL',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.campaignId).toBe('campaign-1')
      expect(data.data.targetCount).toBe(3)
      expect(data.data.successCount).toBe(3)
      expect(pushModule.sendPushNotification).toHaveBeenCalledWith({
        tokens: ['token-1', 'token-2', 'token-3'],
        title: '[망원시장] 주말 특별 할인',
        body: '모든 상점 20% 할인!',
        data: {
          type: 'marketing',
          marketId: 'market-1',
          campaignId: 'campaign-1',
        },
      })
    })

    it('should target only favorite customers', async () => {
      const mockMarket = {
        id: 'market-1',
        marketName: '망원시장',
        totalStores: 50,
      }

      const mockFavoriteCounts = [{ userId: 'user-1' }, { userId: 'user-2' }]

      const mockPushTokens = [{ token: 'token-1' }, { token: 'token-2' }]

      const mockCampaign = {
        id: 'campaign-2',
        marketId: 'market-1',
        title: '단골 고객 감사 이벤트',
        message: '단골 고객님께 특별 혜택!',
        targetAudience: 'FAVORITES_ONLY',
        createdBy: 'dev-association-admin',
        status: 'SENT',
        targetCount: 2,
        successCount: 0,
        failureCount: 0,
        sentAt: new Date(),
      }

      vi.mocked(prisma.market.findUnique).mockResolvedValue(mockMarket as any)
      vi.mocked(prisma.favorite.groupBy).mockResolvedValue(mockFavoriteCounts as any)
      vi.mocked(prisma.pushToken.findMany).mockResolvedValue(mockPushTokens as any)
      vi.mocked(prisma.marketingCampaign.create).mockResolvedValue(mockCampaign as any)
      vi.mocked(prisma.marketingCampaign.update).mockResolvedValue(mockCampaign as any)

      vi.mocked(pushModule.sendPushNotification).mockResolvedValue({
        successCount: 2,
        failureCount: 0,
        invalidTokens: [],
      })

      const request = new NextRequest('http://localhost:3000/api/association/marketing/broadcast', {
        method: 'POST',
        body: JSON.stringify({
          marketId: 'market-1',
          title: '단골 고객 감사 이벤트',
          message: '단골 고객님께 특별 혜택!',
          targetAudience: 'FAVORITES_ONLY',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.targetCount).toBe(2)
      expect(pushModule.sendPushNotification).toHaveBeenCalled()
    })

    it('should handle invalid tokens by removing them', async () => {
      const mockMarket = {
        id: 'market-1',
        marketName: '망원시장',
        totalStores: 50,
      }

      const mockFavorites = [{ userId: 'user-1' }, { userId: 'user-2' }]

      const mockPushTokens = [{ token: 'token-1' }, { token: 'invalid-token' }]

      const mockCampaign = {
        id: 'campaign-3',
        marketId: 'market-1',
        title: '새해 특가',
        message: '2025년 새해 특가 이벤트!',
        targetAudience: 'ALL',
        createdBy: 'dev-association-admin',
        status: 'SENT',
        targetCount: 2,
        successCount: 1,
        failureCount: 1,
        sentAt: new Date(),
      }

      vi.mocked(prisma.market.findUnique).mockResolvedValue(mockMarket as any)
      vi.mocked(prisma.favorite.findMany).mockResolvedValue(mockFavorites as any)
      vi.mocked(prisma.pushToken.findMany).mockResolvedValue(mockPushTokens as any)
      vi.mocked(prisma.marketingCampaign.create).mockResolvedValue(mockCampaign as any)
      vi.mocked(prisma.marketingCampaign.update).mockResolvedValue(mockCampaign as any)

      vi.mocked(pushModule.sendPushNotification).mockResolvedValue({
        successCount: 1,
        failureCount: 1,
        invalidTokens: ['invalid-token'],
      })

      const request = new NextRequest('http://localhost:3000/api/association/marketing/broadcast', {
        method: 'POST',
        body: JSON.stringify({
          marketId: 'market-1',
          title: '새해 특가',
          message: '2025년 새해 특가 이벤트!',
          targetAudience: 'ALL',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.data.successCount).toBe(1)
      expect(data.data.failureCount).toBe(1)
      expect(pushModule.removeInvalidPushTokens).toHaveBeenCalledWith(['invalid-token'])
    })

    it('should return 400 if required fields are missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/association/marketing/broadcast', {
        method: 'POST',
        body: JSON.stringify({
          marketId: 'market-1',
          // title and message missing
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('marketId, title, message are required')
    })

    it('should return 404 if market not found', async () => {
      vi.mocked(prisma.market.findUnique).mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/association/marketing/broadcast', {
        method: 'POST',
        body: JSON.stringify({
          marketId: 'non-existent-market',
          title: 'Test',
          message: 'Test message',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('Market not found')
    })

    it('should return 400 if no target users found', async () => {
      const mockMarket = {
        id: 'market-1',
        marketName: '망원시장',
        totalStores: 50,
      }

      vi.mocked(prisma.market.findUnique).mockResolvedValue(mockMarket as any)
      vi.mocked(prisma.favorite.findMany).mockResolvedValue([])

      const request = new NextRequest('http://localhost:3000/api/association/marketing/broadcast', {
        method: 'POST',
        body: JSON.stringify({
          marketId: 'market-1',
          title: 'Test',
          message: 'Test message',
          targetAudience: 'ALL',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('No target users found for this market')
    })
  })

  describe('GET /api/association/marketing/broadcast', () => {
    it('should return campaign list for a market', async () => {
      const mockCampaigns = [
        {
          id: 'campaign-1',
          marketId: 'market-1',
          title: '주말 특가',
          message: '20% 할인!',
          targetAudience: 'ALL',
          status: 'SENT',
          targetCount: 100,
          successCount: 95,
          failureCount: 5,
          createdAt: new Date('2025-01-01'),
          sentAt: new Date('2025-01-01'),
        },
        {
          id: 'campaign-2',
          marketId: 'market-1',
          title: '단골 감사 이벤트',
          message: '단골 고객 특별 혜택',
          targetAudience: 'FAVORITES_ONLY',
          status: 'SENT',
          targetCount: 50,
          successCount: 48,
          failureCount: 2,
          createdAt: new Date('2025-01-02'),
          sentAt: new Date('2025-01-02'),
        },
      ]

      vi.mocked(prisma.marketingCampaign.findMany).mockResolvedValue(mockCampaigns as any)

      const request = new NextRequest(
        'http://localhost:3000/api/association/marketing/broadcast?marketId=market-1'
      )

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toHaveLength(2)
      expect(data.data[0].id).toBe('campaign-1')
      expect(data.data[1].id).toBe('campaign-2')
    })

    it('should return 400 if marketId is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/association/marketing/broadcast')

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('marketId is required')
    })
  })
})
