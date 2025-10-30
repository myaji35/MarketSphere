import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * 단골 상점 목록 조회 API
 * GET /api/favorites?userId={userId}
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    const favorites = await prisma.favorite.findMany({
      where: { userId },
      include: {
        store: {
          include: {
            market: {
              select: {
                marketName: true,
              },
            },
            _count: {
              select: {
                products: true,
                timeSales: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({
      success: true,
      data: favorites.map((fav) => ({
        id: fav.id,
        storeId: fav.storeId,
        storeName: fav.store.storeName,
        category: fav.store.category,
        location: fav.store.location,
        phone: fav.store.phone,
        photoUrl: fav.store.photoUrl,
        marketName: fav.store.market.marketName,
        productsCount: fav.store._count.products,
        timeSalesCount: fav.store._count.timeSales,
        createdAt: fav.createdAt,
      })),
    })
  } catch (error) {
    console.error('Favorites list error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * 단골 등록 API
 * POST /api/favorites
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, storeId } = body

    if (!userId || !storeId) {
      return NextResponse.json({ error: 'userId and storeId are required' }, { status: 400 })
    }

    // 상점 존재 확인
    const store = await prisma.store.findUnique({
      where: { id: storeId },
      select: {
        id: true,
        storeName: true,
        approvalStatus: true,
      },
    })

    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 })
    }

    if (store.approvalStatus !== 'APPROVED') {
      return NextResponse.json({ error: 'Store is not approved yet' }, { status: 400 })
    }

    // 이미 단골 등록되어 있는지 확인
    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        userId_storeId: {
          userId,
          storeId,
        },
      },
    })

    if (existingFavorite) {
      return NextResponse.json({ error: 'Already added to favorites' }, { status: 409 })
    }

    // 단골 등록
    const favorite = await prisma.favorite.create({
      data: {
        userId,
        storeId,
      },
      include: {
        store: {
          select: {
            storeName: true,
            category: true,
          },
        },
      },
    })

    // TODO: 푸시 알림 전송 (단골 등록 완료)
    // await sendPushNotification({
    //   tokens: [userPushToken],
    //   title: '단골 등록 완료',
    //   body: `${store.storeName}을(를) 단골 상점으로 등록했습니다!`,
    // })

    return NextResponse.json({
      success: true,
      data: {
        id: favorite.id,
        storeId: favorite.storeId,
        storeName: favorite.store.storeName,
        category: favorite.store.category,
        createdAt: favorite.createdAt,
      },
    })
  } catch (error) {
    console.error('Add favorite error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * 단골 해제 API
 * DELETE /api/favorites/{favoriteId}
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const favoriteId = searchParams.get('id')
    const userId = searchParams.get('userId')

    if (!favoriteId || !userId) {
      return NextResponse.json({ error: 'id and userId are required' }, { status: 400 })
    }

    // 단골 존재 확인 및 권한 확인
    const favorite = await prisma.favorite.findUnique({
      where: { id: favoriteId },
    })

    if (!favorite) {
      return NextResponse.json({ error: 'Favorite not found' }, { status: 404 })
    }

    if (favorite.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // 단골 해제
    await prisma.favorite.delete({
      where: { id: favoriteId },
    })

    return NextResponse.json({
      success: true,
      message: 'Favorite removed successfully',
    })
  } catch (error) {
    console.error('Remove favorite error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
