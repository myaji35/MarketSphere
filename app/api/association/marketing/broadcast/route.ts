import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendPushNotification, removeInvalidPushTokens } from '@/lib/push'

/**
 * 시장 전체 푸시 알림 발송 API
 * POST /api/association/marketing/broadcast
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { marketId, title, message, targetAudience = 'ALL', ageMin, ageMax } = body

    // 입력 검증
    if (!marketId || !title || !message) {
      return NextResponse.json({ error: 'marketId, title, message are required' }, { status: 400 })
    }

    // TODO: 실제로는 세션에서 userId 가져오기
    const userId = 'dev-association-admin'

    // 권한 확인: 상인회 관리자인지 확인
    // TODO: 실제 권한 확인 로직 구현 필요
    // const hasPermission = await checkAssociationAdminPermission(userId, marketId)
    // if (!hasPermission) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    // }

    // 시장 존재 확인
    const market = await prisma.market.findUnique({
      where: { id: marketId },
    })

    if (!market) {
      return NextResponse.json({ error: 'Market not found' }, { status: 404 })
    }

    // 타겟 대상자 결정
    let targetUserIds: string[] = []

    switch (targetAudience) {
      case 'ALL': {
        // 전체 고객: 해당 시장의 상점을 단골로 등록한 모든 유저
        const favorites = await prisma.favorite.findMany({
          where: {
            store: {
              marketId,
              approvalStatus: 'APPROVED',
            },
          },
          select: {
            userId: true,
          },
          distinct: ['userId'],
        })
        targetUserIds = favorites.map((f) => f.userId)
        break
      }

      case 'FAVORITES_ONLY': {
        // 단골만: 2개 이상의 상점을 단골로 등록한 유저
        const favoriteCounts = await prisma.favorite.groupBy({
          by: ['userId'],
          where: {
            store: {
              marketId,
              approvalStatus: 'APPROVED',
            },
          },
          _count: {
            userId: true,
          },
          having: {
            userId: {
              _count: {
                gte: 2,
              },
            },
          },
        })
        targetUserIds = favoriteCounts.map((f) => f.userId)
        break
      }

      case 'AGE_RANGE': {
        // 연령대별: 나이 정보가 있는 경우 (현재 스키마에는 없음, 향후 추가 필요)
        // TODO: User 모델에 birthDate 필드 추가 후 구현
        console.warn('AGE_RANGE targeting not yet implemented - using ALL instead')
        const favorites = await prisma.favorite.findMany({
          where: {
            store: {
              marketId,
              approvalStatus: 'APPROVED',
            },
          },
          select: {
            userId: true,
          },
          distinct: ['userId'],
        })
        targetUserIds = favorites.map((f) => f.userId)
        break
      }

      case 'LOCATION_BASED': {
        // 위치 기반: 시장 근처에 사는 유저 (현재 스키마에는 없음, 향후 추가 필요)
        // TODO: User 모델에 address/location 필드 추가 후 구현
        console.warn('LOCATION_BASED targeting not yet implemented - using ALL instead')
        const favorites = await prisma.favorite.findMany({
          where: {
            store: {
              marketId,
              approvalStatus: 'APPROVED',
            },
          },
          select: {
            userId: true,
          },
          distinct: ['userId'],
        })
        targetUserIds = favorites.map((f) => f.userId)
        break
      }

      default:
        return NextResponse.json({ error: 'Invalid targetAudience' }, { status: 400 })
    }

    // 대상자가 없으면 에러
    if (targetUserIds.length === 0) {
      return NextResponse.json({ error: 'No target users found for this market' }, { status: 400 })
    }

    // 푸시 토큰 조회
    const pushTokens = await prisma.pushToken.findMany({
      where: {
        userId: {
          in: targetUserIds,
        },
      },
      select: {
        token: true,
      },
    })

    const tokens = pushTokens.map((pt) => pt.token)

    // 캠페인 생성
    const campaign = await prisma.marketingCampaign.create({
      data: {
        marketId,
        title,
        message,
        targetAudience,
        ageMin,
        ageMax,
        createdBy: userId,
        status: 'SENT',
        targetCount: targetUserIds.length,
        sentAt: new Date(),
      },
    })

    // 푸시 알림 발송
    let pushResult = {
      successCount: 0,
      failureCount: 0,
      invalidTokens: [] as string[],
    }

    if (tokens.length > 0) {
      pushResult = await sendPushNotification({
        tokens,
        title: `[${market.marketName}] ${title}`,
        body: message,
        data: {
          type: 'marketing',
          marketId,
          campaignId: campaign.id,
        },
      })

      // 잘못된 토큰 삭제
      if (pushResult.invalidTokens.length > 0) {
        await removeInvalidPushTokens(pushResult.invalidTokens)
      }

      // 캠페인 결과 업데이트
      await prisma.marketingCampaign.update({
        where: { id: campaign.id },
        data: {
          successCount: pushResult.successCount,
          failureCount: pushResult.failureCount,
        },
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        campaignId: campaign.id,
        marketName: market.marketName,
        targetCount: targetUserIds.length,
        tokensCount: tokens.length,
        successCount: pushResult.successCount,
        failureCount: pushResult.failureCount,
        sentAt: campaign.sentAt,
      },
    })
  } catch (error) {
    console.error('Marketing broadcast error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * 캠페인 목록 조회 API
 * GET /api/association/marketing/broadcast?marketId={marketId}
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const marketId = searchParams.get('marketId')

    if (!marketId) {
      return NextResponse.json({ error: 'marketId is required' }, { status: 400 })
    }

    // TODO: 권한 확인

    const campaigns = await prisma.marketingCampaign.findMany({
      where: { marketId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    return NextResponse.json({
      success: true,
      data: campaigns,
    })
  } catch (error) {
    console.error('Campaign list fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
