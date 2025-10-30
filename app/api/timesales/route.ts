import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserId } from '@/lib/get-user-id'
import { sendTimeSalePushNotification, removeInvalidPushTokens } from '@/lib/push'

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserId()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const {
      storeId,
      title,
      description,
      discountRate,
      startTime,
      endTime,
      sendPushNotification: shouldSendPush,
    } = body

    // 상점 소유권 확인
    const store = await prisma.store.findFirst({
      where: {
        id: storeId,
        ownerId: userId,
      },
    })

    if (!store) {
      return NextResponse.json({ error: 'Store not found or unauthorized' }, { status: 403 })
    }

    // 타임세일 생성
    const timeSale = await prisma.timeSale.create({
      data: {
        storeId,
        title,
        description,
        discountRate: parseInt(discountRate),
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        isActive: true,
      },
    })

    // 푸시 알림 발송 (단골 고객에게)
    let pushResult = null
    if (shouldSendPush) {
      // 해당 상점을 '찜'한 고객들의 푸시 토큰 조회
      const favorites = await prisma.favorite.findMany({
        where: {
          storeId,
        },
        include: {
          user: {
            include: {
              pushTokens: true,
            },
          },
        },
      })

      const tokens = favorites.flatMap((fav) => fav.user.pushTokens.map((pt) => pt.token))

      if (tokens.length > 0) {
        // Firebase FCM을 통해 푸시 알림 발송
        pushResult = await sendTimeSalePushNotification({
          storeId,
          storeName: store.storeName,
          title,
          discountRate: parseInt(discountRate),
          endTime: new Date(endTime),
          tokens,
        })

        // 잘못된 토큰 삭제
        if (pushResult.invalidTokens.length > 0) {
          await removeInvalidPushTokens(pushResult.invalidTokens)
        }

        console.log(
          `✅ 타임세일 푸시 발송 완료: ${pushResult.successCount}/${tokens.length} (실패: ${pushResult.failureCount})`
        )
      }
    }

    return NextResponse.json({
      success: true,
      data: timeSale,
      pushSent: shouldSendPush,
      pushResult: pushResult
        ? {
            totalTargets: pushResult.successCount + pushResult.failureCount,
            successCount: pushResult.successCount,
            failureCount: pushResult.failureCount,
          }
        : null,
    })
  } catch (error) {
    console.error('Error creating time sale:', error)
    return NextResponse.json({ error: 'Failed to create time sale' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const userId = await getUserId()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const storeId = searchParams.get('storeId')

    if (!storeId) {
      return NextResponse.json({ error: 'Store ID is required' }, { status: 400 })
    }

    // 상점 소유권 확인
    const store = await prisma.store.findFirst({
      where: {
        id: storeId,
        ownerId: userId,
      },
    })

    if (!store) {
      return NextResponse.json({ error: 'Store not found or unauthorized' }, { status: 403 })
    }

    // 타임세일 목록 조회
    const timeSales = await prisma.timeSale.findMany({
      where: {
        storeId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({
      success: true,
      data: timeSales,
    })
  } catch (error) {
    console.error('Error fetching time sales:', error)
    return NextResponse.json({ error: 'Failed to fetch time sales' }, { status: 500 })
  }
}
