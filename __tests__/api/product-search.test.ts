import { describe, it, expect, beforeEach, vi } from 'vitest'
import { GET } from '@/app/api/products/search/route'
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    product: {
      findMany: vi.fn(),
    },
  },
}))

describe('Product Search API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET /api/products/search', () => {
    it('should search products by name', async () => {
      const mockProducts = [
        {
          id: 'product-1',
          productName: '신선한 사과',
          price: 5000,
          discountPrice: null,
          imageUrl: '/apple.jpg',
          stock: 10,
          isAvailable: true,
          aiGeneratedDescription: '맛있는 사과',
          store: {
            id: 'store-1',
            storeName: '과일가게',
            category: '과일',
            location: '1층',
            phone: '010-1234-5678',
            marketId: 'market-1',
            market: {
              marketName: '망원시장',
            },
          },
        },
        {
          id: 'product-2',
          productName: '홍옥 사과',
          price: 4000,
          discountPrice: 3500,
          imageUrl: '/apple2.jpg',
          stock: 5,
          isAvailable: true,
          aiGeneratedDescription: '달콤한 사과',
          store: {
            id: 'store-2',
            storeName: '청과물',
            category: '과일',
            location: '2층',
            phone: '010-2345-6789',
            marketId: 'market-1',
            market: {
              marketName: '망원시장',
            },
          },
        },
      ]

      vi.mocked(prisma.product.findMany).mockResolvedValue(mockProducts as any)

      const request = new NextRequest('http://localhost:3000/api/products/search?q=사과')

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.query).toBe('사과')
      expect(data.data.results).toHaveLength(2)
      expect(data.data.stats.totalProducts).toBe(2)
      expect(data.data.stats.totalStores).toBe(2)
    })

    it('should group products by store', async () => {
      const mockProducts = [
        {
          id: 'product-1',
          productName: '사과',
          price: 5000,
          discountPrice: null,
          imageUrl: '/apple1.jpg',
          stock: 10,
          isAvailable: true,
          aiGeneratedDescription: null,
          store: {
            id: 'store-1',
            storeName: '과일가게',
            category: '과일',
            location: '1층',
            phone: '010-1234-5678',
            marketId: 'market-1',
            market: {
              marketName: '망원시장',
            },
          },
        },
        {
          id: 'product-2',
          productName: '배',
          price: 6000,
          discountPrice: null,
          imageUrl: '/pear.jpg',
          stock: 8,
          isAvailable: true,
          aiGeneratedDescription: null,
          store: {
            id: 'store-1',
            storeName: '과일가게',
            category: '과일',
            location: '1층',
            phone: '010-1234-5678',
            marketId: 'market-1',
            market: {
              marketName: '망원시장',
            },
          },
        },
      ]

      vi.mocked(prisma.product.findMany).mockResolvedValue(mockProducts as any)

      const request = new NextRequest('http://localhost:3000/api/products/search?q=과일')

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.data.results).toHaveLength(1)
      expect(data.data.results[0].products).toHaveLength(2)
      expect(data.data.results[0].store.storeName).toBe('과일가게')
    })

    it('should sort by price ascending', async () => {
      const mockProducts = [
        {
          id: 'product-1',
          productName: '사과',
          price: 5000,
          discountPrice: null,
          imageUrl: '/apple.jpg',
          stock: 10,
          isAvailable: true,
          aiGeneratedDescription: null,
          store: {
            id: 'store-1',
            storeName: '비싼가게',
            category: '과일',
            location: null,
            phone: '010-1111-1111',
            marketId: 'market-1',
            market: { marketName: '망원시장' },
          },
        },
        {
          id: 'product-2',
          productName: '사과',
          price: 3000,
          discountPrice: null,
          imageUrl: '/apple2.jpg',
          stock: 5,
          isAvailable: true,
          aiGeneratedDescription: null,
          store: {
            id: 'store-2',
            storeName: '싼가게',
            category: '과일',
            location: null,
            phone: '010-2222-2222',
            marketId: 'market-1',
            market: { marketName: '망원시장' },
          },
        },
      ]

      vi.mocked(prisma.product.findMany).mockResolvedValue(mockProducts as any)

      const request = new NextRequest(
        'http://localhost:3000/api/products/search?q=사과&sortBy=price_asc'
      )

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.data.results[0].store.storeName).toBe('싼가게')
      expect(data.data.results[0].minPrice).toBe(3000)
    })

    it('should calculate price statistics', async () => {
      const mockProducts = [
        {
          id: 'product-1',
          productName: '사과',
          price: 3000,
          discountPrice: null,
          imageUrl: '/apple1.jpg',
          stock: 10,
          isAvailable: true,
          aiGeneratedDescription: null,
          store: {
            id: 'store-1',
            storeName: '가게1',
            category: '과일',
            location: null,
            phone: '010-1111-1111',
            marketId: 'market-1',
            market: { marketName: '망원시장' },
          },
        },
        {
          id: 'product-2',
          productName: '사과',
          price: 5000,
          discountPrice: null,
          imageUrl: '/apple2.jpg',
          stock: 5,
          isAvailable: true,
          aiGeneratedDescription: null,
          store: {
            id: 'store-2',
            storeName: '가게2',
            category: '과일',
            location: null,
            phone: '010-2222-2222',
            marketId: 'market-1',
            market: { marketName: '망원시장' },
          },
        },
      ]

      vi.mocked(prisma.product.findMany).mockResolvedValue(mockProducts as any)

      const request = new NextRequest('http://localhost:3000/api/products/search?q=사과')

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.data.stats.minPrice).toBe(3000)
      expect(data.data.stats.maxPrice).toBe(5000)
      expect(data.data.stats.avgPrice).toBe(4000)
    })

    it('should return 400 if query is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/products/search')

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Search query is required')
    })

    it('should return empty results if no products found', async () => {
      vi.mocked(prisma.product.findMany).mockResolvedValue([])

      const request = new NextRequest('http://localhost:3000/api/products/search?q=없는상품')

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.data.results).toHaveLength(0)
      expect(data.data.stats.totalProducts).toBe(0)
      expect(data.data.stats.totalStores).toBe(0)
    })
  })
})
