import { describe, it, expect, beforeEach, vi } from 'vitest'
import { GET, POST, DELETE } from '@/app/api/favorites/route'
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    favorite: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
    store: {
      findUnique: vi.fn(),
    },
  },
}))

describe('Favorites API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET /api/favorites', () => {
    it('should return user favorite stores', async () => {
      const mockFavorites = [
        {
          id: 'fav-1',
          userId: 'user-1',
          storeId: 'store-1',
          createdAt: new Date(),
          store: {
            id: 'store-1',
            storeName: '과일가게',
            category: '과일',
            location: '1층',
            phone: '010-1234-5678',
            photoUrl: null,
            market: {
              marketName: '망원시장',
            },
            _count: {
              products: 10,
              timeSales: 3,
            },
          },
        },
      ]

      vi.mocked(prisma.favorite.findMany).mockResolvedValue(mockFavorites as any)

      const request = new NextRequest('http://localhost:3000/api/favorites?userId=user-1')

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toHaveLength(1)
      expect(data.data[0].storeName).toBe('과일가게')
      expect(data.data[0].productsCount).toBe(10)
      expect(data.data[0].timeSalesCount).toBe(3)
    })

    it('should return 400 if userId is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/favorites')

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('userId is required')
    })
  })

  describe('POST /api/favorites', () => {
    it('should add store to favorites', async () => {
      const mockStore = {
        id: 'store-1',
        storeName: '과일가게',
        approvalStatus: 'APPROVED',
      }

      const mockFavorite = {
        id: 'fav-1',
        userId: 'user-1',
        storeId: 'store-1',
        createdAt: new Date(),
        store: {
          storeName: '과일가게',
          category: '과일',
        },
      }

      vi.mocked(prisma.store.findUnique).mockResolvedValue(mockStore as any)
      vi.mocked(prisma.favorite.findUnique).mockResolvedValue(null)
      vi.mocked(prisma.favorite.create).mockResolvedValue(mockFavorite as any)

      const request = new NextRequest('http://localhost:3000/api/favorites', {
        method: 'POST',
        body: JSON.stringify({ userId: 'user-1', storeId: 'store-1' }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.storeName).toBe('과일가게')
    })

    it('should return 400 if userId or storeId is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/favorites', {
        method: 'POST',
        body: JSON.stringify({ userId: 'user-1' }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('userId and storeId are required')
    })

    it('should return 404 if store not found', async () => {
      vi.mocked(prisma.store.findUnique).mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/favorites', {
        method: 'POST',
        body: JSON.stringify({ userId: 'user-1', storeId: 'non-existent' }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('Store not found')
    })

    it('should return 400 if store is not approved', async () => {
      const mockStore = {
        id: 'store-1',
        storeName: '과일가게',
        approvalStatus: 'PENDING',
      }

      vi.mocked(prisma.store.findUnique).mockResolvedValue(mockStore as any)

      const request = new NextRequest('http://localhost:3000/api/favorites', {
        method: 'POST',
        body: JSON.stringify({ userId: 'user-1', storeId: 'store-1' }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Store is not approved yet')
    })

    it('should return 409 if already in favorites', async () => {
      const mockStore = {
        id: 'store-1',
        storeName: '과일가게',
        approvalStatus: 'APPROVED',
      }

      const mockExistingFavorite = {
        id: 'fav-1',
        userId: 'user-1',
        storeId: 'store-1',
      }

      vi.mocked(prisma.store.findUnique).mockResolvedValue(mockStore as any)
      vi.mocked(prisma.favorite.findUnique).mockResolvedValue(mockExistingFavorite as any)

      const request = new NextRequest('http://localhost:3000/api/favorites', {
        method: 'POST',
        body: JSON.stringify({ userId: 'user-1', storeId: 'store-1' }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(409)
      expect(data.error).toBe('Already added to favorites')
    })
  })

  describe('DELETE /api/favorites', () => {
    it('should remove favorite', async () => {
      const mockFavorite = {
        id: 'fav-1',
        userId: 'user-1',
        storeId: 'store-1',
      }

      vi.mocked(prisma.favorite.findUnique).mockResolvedValue(mockFavorite as any)
      vi.mocked(prisma.favorite.delete).mockResolvedValue(mockFavorite as any)

      const request = new NextRequest(
        'http://localhost:3000/api/favorites?id=fav-1&userId=user-1',
        {
          method: 'DELETE',
        }
      )

      const response = await DELETE(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.message).toBe('Favorite removed successfully')
    })

    it('should return 400 if id or userId is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/favorites?id=fav-1', {
        method: 'DELETE',
      })

      const response = await DELETE(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('id and userId are required')
    })

    it('should return 404 if favorite not found', async () => {
      vi.mocked(prisma.favorite.findUnique).mockResolvedValue(null)

      const request = new NextRequest(
        'http://localhost:3000/api/favorites?id=non-existent&userId=user-1',
        {
          method: 'DELETE',
        }
      )

      const response = await DELETE(request)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('Favorite not found')
    })

    it('should return 403 if user is not authorized', async () => {
      const mockFavorite = {
        id: 'fav-1',
        userId: 'user-2',
        storeId: 'store-1',
      }

      vi.mocked(prisma.favorite.findUnique).mockResolvedValue(mockFavorite as any)

      const request = new NextRequest(
        'http://localhost:3000/api/favorites?id=fav-1&userId=user-1',
        {
          method: 'DELETE',
        }
      )

      const response = await DELETE(request)
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.error).toBe('Unauthorized')
    })
  })
})
