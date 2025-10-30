import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * 통합 상품 검색 API
 * GET /api/products/search?q={query}&marketId={marketId}&sortBy={sortBy}
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const marketId = searchParams.get('marketId')
    const sortBy = searchParams.get('sortBy') || 'relevance' // relevance, price_asc, price_desc, newest

    if (!query) {
      return NextResponse.json({ error: 'Search query is required' }, { status: 400 })
    }

    // 검색 조건 구성
    const whereCondition: any = {
      productName: {
        contains: query,
        mode: 'insensitive',
      },
      isAvailable: true,
      store: {
        approvalStatus: 'APPROVED',
      },
    }

    // 시장 필터링 (선택사항)
    if (marketId) {
      whereCondition.store = {
        ...whereCondition.store,
        marketId,
      }
    }

    // 정렬 조건 구성
    let orderBy: any = {}
    switch (sortBy) {
      case 'price_asc':
        orderBy = { price: 'asc' }
        break
      case 'price_desc':
        orderBy = { price: 'desc' }
        break
      case 'newest':
        orderBy = { createdAt: 'desc' }
        break
      default:
        // relevance: 기본적으로 최신순 (나중에 검색 점수 기반으로 개선 가능)
        orderBy = { createdAt: 'desc' }
    }

    // 상품 검색
    const products = await prisma.product.findMany({
      where: whereCondition,
      include: {
        store: {
          select: {
            id: true,
            storeName: true,
            category: true,
            location: true,
            phone: true,
            marketId: true,
            market: {
              select: {
                marketName: true,
              },
            },
          },
        },
      },
      orderBy,
      take: 50, // 최대 50개까지
    })

    // 검색 결과 그룹화 (상점별)
    const storeGroups = products.reduce(
      (acc, product) => {
        const storeId = product.store.id
        if (!acc[storeId]) {
          acc[storeId] = {
            store: {
              id: product.store.id,
              storeName: product.store.storeName,
              category: product.store.category,
              location: product.store.location,
              phone: product.store.phone,
              marketName: product.store.market.marketName,
            },
            products: [],
            minPrice: product.price,
            maxPrice: product.price,
          }
        }

        acc[storeId].products.push({
          id: product.id,
          productName: product.productName,
          price: product.price,
          discountPrice: product.discountPrice,
          imageUrl: product.imageUrl,
          stock: product.stock,
          aiGeneratedDescription: product.aiGeneratedDescription,
        })

        // 최저가/최고가 업데이트
        if (product.price < acc[storeId].minPrice) {
          acc[storeId].minPrice = product.price
        }
        if (product.price > acc[storeId].maxPrice) {
          acc[storeId].maxPrice = product.price
        }

        return acc
      },
      {} as Record<
        string,
        {
          store: any
          products: any[]
          minPrice: number
          maxPrice: number
        }
      >
    )

    // 배열로 변환 및 정렬
    const results = Object.values(storeGroups).sort((a, b) => {
      if (sortBy === 'price_asc') {
        return a.minPrice - b.minPrice
      } else if (sortBy === 'price_desc') {
        return b.maxPrice - a.maxPrice
      }
      return 0 // 기본값은 그대로 유지
    })

    // 검색 통계
    const stats = {
      totalProducts: products.length,
      totalStores: results.length,
      minPrice: products.length > 0 ? Math.min(...products.map((p) => p.price)) : 0,
      maxPrice: products.length > 0 ? Math.max(...products.map((p) => p.price)) : 0,
      avgPrice:
        products.length > 0
          ? Math.round(products.reduce((sum, p) => sum + p.price, 0) / products.length)
          : 0,
    }

    return NextResponse.json({
      success: true,
      data: {
        query,
        sortBy,
        results,
        stats,
      },
    })
  } catch (error) {
    console.error('Product search error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
