import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserId } from '@/lib/get-user-id'

/**
 * 상인회 통합 대시보드 데이터 조회 API
 * GET /api/association/dashboard?marketId={marketId}&period={period}
 */
export async function GET(req: NextRequest) {
  try {
    const userId = await getUserId()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const marketId = searchParams.get('marketId')
    const period = searchParams.get('period') || 'week' // day, week, month

    if (!marketId) {
      return NextResponse.json({ error: 'Market ID is required' }, { status: 400 })
    }

    // 상인회 관리자 권한 확인
    const associationAdmin = await prisma.associationAdmin.findFirst({
      where: {
        userId,
      },
      include: {
        association: {
          include: {
            markets: true,
          },
        },
      },
    })

    if (!associationAdmin) {
      return NextResponse.json({ error: 'Association admin access required' }, { status: 403 })
    }

    // 시장이 상인회에 속하는지 확인
    const market = associationAdmin.association.markets.find((m) => m.id === marketId)
    if (!market) {
      return NextResponse.json({ error: 'Market not found in your association' }, { status: 404 })
    }

    // 기간 설정
    const now = new Date()
    const startDate = new Date()

    switch (period) {
      case 'day':
        startDate.setDate(now.getDate() - 1)
        break
      case 'week':
        startDate.setDate(now.getDate() - 7)
        break
      case 'month':
        startDate.setMonth(now.getMonth() - 1)
        break
      default:
        startDate.setDate(now.getDate() - 7)
    }

    // 1. 시장 전체 상점 수 및 승인 상태별 통계
    const storeStats = await prisma.store.groupBy({
      by: ['approvalStatus'],
      where: {
        marketId,
      },
      _count: true,
    })

    const totalStores = await prisma.store.count({
      where: { marketId },
    })

    const approvedStores = await prisma.store.count({
      where: {
        marketId,
        approvalStatus: 'APPROVED',
      },
    })

    // 2. 시장 전체 타임세일 통계
    const timeSalesCount = await prisma.timeSale.count({
      where: {
        store: {
          marketId,
        },
        createdAt: {
          gte: startDate,
        },
      },
    })

    const activeTimeSales = await prisma.timeSale.count({
      where: {
        store: {
          marketId,
        },
        isActive: true,
        startTime: {
          lte: now,
        },
        endTime: {
          gte: now,
        },
      },
    })

    // 3. 인기 상점 순위 (상품 수 기준)
    const topStores = await prisma.store.findMany({
      where: {
        marketId,
        approvalStatus: 'APPROVED',
      },
      include: {
        _count: {
          select: {
            products: true,
            timeSales: true,
          },
        },
      },
      orderBy: {
        products: {
          _count: 'desc',
        },
      },
      take: 10,
    })

    // 4. 최근 가입 신청 (대기 중인 상점)
    const pendingStores = await prisma.store.findMany({
      where: {
        marketId,
        approvalStatus: 'PENDING',
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
      select: {
        id: true,
        storeName: true,
        category: true,
        phone: true,
        location: true,
        createdAt: true,
        owner: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    })

    // 5. 카테고리별 상점 분포
    const categoryDistribution = await prisma.store.groupBy({
      by: ['category'],
      where: {
        marketId,
        approvalStatus: 'APPROVED',
      },
      _count: true,
      orderBy: {
        _count: {
          category: 'desc',
        },
      },
    })

    // 6. 최근 활동 (타임세일 생성)
    const recentActivity = await prisma.timeSale.findMany({
      where: {
        store: {
          marketId,
        },
        createdAt: {
          gte: startDate,
        },
      },
      include: {
        store: {
          select: {
            storeName: true,
            category: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 20,
    })

    // 대시보드 데이터 구성
    const dashboardData = {
      market: {
        id: market.id,
        name: market.marketName,
        totalStores: market.totalStores,
        address: market.address,
      },
      overview: {
        totalStores,
        approvedStores,
        pendingStores: storeStats.find((s) => s.approvalStatus === 'PENDING')?._count || 0,
        rejectedStores: storeStats.find((s) => s.approvalStatus === 'REJECTED')?._count || 0,
        suspendedStores: storeStats.find((s) => s.approvalStatus === 'SUSPENDED')?._count || 0,
      },
      timeSales: {
        total: timeSalesCount,
        active: activeTimeSales,
        period,
      },
      topStores: topStores.map((store) => ({
        id: store.id,
        name: store.storeName,
        category: store.category,
        productsCount: store._count.products,
        timeSalesCount: store._count.timeSales,
        approvalStatus: store.approvalStatus,
      })),
      pendingApprovals: pendingStores,
      categoryDistribution: categoryDistribution.map((cat) => ({
        category: cat.category,
        count: cat._count,
      })),
      recentActivity: recentActivity.map((activity) => ({
        id: activity.id,
        type: 'timesale',
        storeName: activity.store.storeName,
        category: activity.store.category,
        title: activity.title,
        discountRate: activity.discountRate,
        startTime: activity.startTime,
        endTime: activity.endTime,
        createdAt: activity.createdAt,
      })),
      period: {
        start: startDate,
        end: now,
        label: period,
      },
    }

    return NextResponse.json({
      success: true,
      data: dashboardData,
    })
  } catch (error) {
    console.error('Association dashboard error:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch dashboard data',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
