import { describe, it, expect, beforeEach, vi } from 'vitest'
import { GET } from '@/app/api/ai/recommendations/route'
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import * as weatherModule from '@/lib/weather'
import * as openaiModule from '@/lib/ai/openai'

// Mock modules
vi.mock('@/lib/weather', () => ({
  getWeatherByCity: vi.fn(),
}))

vi.mock('@/lib/ai/openai', () => ({
  generateChatCompletion: vi.fn(),
}))

vi.mock('@/lib/prisma', () => ({
  prisma: {
    market: {
      findUnique: vi.fn(),
    },
    favorite: {
      findMany: vi.fn(),
    },
  },
}))

describe('AI Recommendations API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET /api/ai/recommendations', () => {
    it('should return AI recommendations with weather context', async () => {
      const mockMarket = {
        id: 'market-1',
        marketName: '망원시장',
        address: '서울시 마포구',
        stores: [
          {
            id: 'store-1',
            storeName: '채소가게',
            category: '채소',
            approvalStatus: 'APPROVED',
            products: [
              {
                id: 'product-1',
                productName: '부추',
                price: 3000,
                isAvailable: true,
              },
              {
                id: 'product-2',
                productName: '대파',
                price: 2000,
                isAvailable: true,
              },
            ],
          },
        ],
      }

      const mockWeather = {
        weather: '비',
        temperature: 18,
        description: '비 오는 날',
        icon: '10d',
      }

      const mockAIResponse = JSON.stringify({
        recommendations: [
          {
            menuName: '파전과 막걸리',
            ingredients: ['부추', '해물', '밀가루', '계란'],
            reason: '비 오는 날엔 역시 파전이죠!',
            category: '비오는 날 음식',
          },
        ],
      })

      vi.mocked(prisma.market.findUnique).mockResolvedValue(mockMarket as any)
      vi.mocked(weatherModule.getWeatherByCity).mockResolvedValue(mockWeather)
      vi.mocked(openaiModule.generateChatCompletion).mockResolvedValue(mockAIResponse)
      vi.mocked(prisma.favorite.findMany).mockResolvedValue([])

      const request = new NextRequest(
        'http://localhost:3000/api/ai/recommendations?marketId=market-1'
      )

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.context.weather).toBe('비')
      expect(data.data.context.temperature).toBe(18)
      expect(data.data.recommendations).toHaveLength(1)
      expect(data.data.recommendations[0].menuName).toBe('파전과 막걸리')
      expect(data.data.recommendations[0].matchedProducts).toBeDefined()
    })

    it('should match products with recommended ingredients', async () => {
      const mockMarket = {
        id: 'market-1',
        marketName: '망원시장',
        address: '서울시 마포구',
        stores: [
          {
            id: 'store-1',
            storeName: '채소가게',
            category: '채소',
            approvalStatus: 'APPROVED',
            products: [
              {
                id: 'product-1',
                productName: '신선한 부추',
                price: 3000,
                isAvailable: true,
              },
            ],
          },
        ],
      }

      const mockWeather = {
        weather: '비',
        temperature: 18,
        description: '비 오는 날',
        icon: '10d',
      }

      const mockAIResponse = JSON.stringify({
        recommendations: [
          {
            menuName: '파전',
            ingredients: ['부추', '밀가루'],
            reason: '비 오는 날 파전',
            category: '비오는 날 음식',
          },
        ],
      })

      vi.mocked(prisma.market.findUnique).mockResolvedValue(mockMarket as any)
      vi.mocked(weatherModule.getWeatherByCity).mockResolvedValue(mockWeather)
      vi.mocked(openaiModule.generateChatCompletion).mockResolvedValue(mockAIResponse)
      vi.mocked(prisma.favorite.findMany).mockResolvedValue([])

      const request = new NextRequest(
        'http://localhost:3000/api/ai/recommendations?marketId=market-1'
      )

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.data.recommendations[0].matchedProducts).toHaveLength(1)
      expect(data.data.recommendations[0].matchedProducts[0].productName).toBe('신선한 부추')
    })

    it('should include user favorite stores in AI context', async () => {
      const mockMarket = {
        id: 'market-1',
        marketName: '망원시장',
        address: '서울시 마포구',
        stores: [],
      }

      const mockWeather = {
        weather: '맑음',
        temperature: 22,
        description: '맑은 날',
        icon: '01d',
      }

      const mockFavorites = [
        {
          userId: 'user-1',
          storeId: 'store-1',
          store: {
            storeName: '채소가게',
            category: '채소',
          },
        },
      ]

      const mockAIResponse = JSON.stringify({
        recommendations: [
          {
            menuName: '샐러드',
            ingredients: ['토마토', '양상추'],
            reason: '신선한 채소로 샐러드',
            category: '건강식',
          },
        ],
      })

      vi.mocked(prisma.market.findUnique).mockResolvedValue(mockMarket as any)
      vi.mocked(weatherModule.getWeatherByCity).mockResolvedValue(mockWeather)
      vi.mocked(openaiModule.generateChatCompletion).mockResolvedValue(mockAIResponse)
      vi.mocked(prisma.favorite.findMany).mockResolvedValue(mockFavorites as any)

      const request = new NextRequest(
        'http://localhost:3000/api/ai/recommendations?marketId=market-1&userId=user-1'
      )

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(prisma.favorite.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 'user-1' },
        })
      )
    })

    it('should use default recommendations if AI parsing fails', async () => {
      const mockMarket = {
        id: 'market-1',
        marketName: '망원시장',
        address: '서울시 마포구',
        stores: [],
      }

      const mockWeather = {
        weather: '비',
        temperature: 18,
        description: '비 오는 날',
        icon: '10d',
      }

      // Invalid JSON response from AI
      const mockAIResponse = 'This is not valid JSON'

      vi.mocked(prisma.market.findUnique).mockResolvedValue(mockMarket as any)
      vi.mocked(weatherModule.getWeatherByCity).mockResolvedValue(mockWeather)
      vi.mocked(openaiModule.generateChatCompletion).mockResolvedValue(mockAIResponse)
      vi.mocked(prisma.favorite.findMany).mockResolvedValue([])

      const request = new NextRequest(
        'http://localhost:3000/api/ai/recommendations?marketId=market-1'
      )

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.data.recommendations.length).toBeGreaterThan(0)
      // Should fall back to default recommendations
      expect(data.data.recommendations[0].menuName).toContain('파전')
    })

    it('should return 400 if marketId is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/ai/recommendations')

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('marketId is required')
    })

    it('should return 404 if market not found', async () => {
      vi.mocked(prisma.market.findUnique).mockResolvedValue(null)

      const request = new NextRequest(
        'http://localhost:3000/api/ai/recommendations?marketId=non-existent'
      )

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('Market not found')
    })
  })
})
