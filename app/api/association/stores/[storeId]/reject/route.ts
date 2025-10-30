import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserId } from '@/lib/get-user-id'

/**
 * 상점 거부 API
 * POST /api/association/stores/[storeId]/reject
 */
export async function POST(req: NextRequest, { params }: { params: { storeId: string } }) {
  try {
    const userId = await getUserId()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { storeId } = params
    const body = await req.json()
    const { reason } = body

    if (!reason) {
      return NextResponse.json({ error: 'Rejection reason is required' }, { status: 400 })
    }

    // 상점 조회
    const store = await prisma.store.findUnique({
      where: { id: storeId },
      include: {
        market: {
          include: {
            association: true,
          },
        },
      },
    })

    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 })
    }

    // 상인회 관리자 권한 확인
    const associationAdmin = await prisma.associationAdmin.findFirst({
      where: {
        userId,
        associationId: store.market.associationId,
      },
    })

    if (!associationAdmin) {
      return NextResponse.json({ error: 'Association admin access required' }, { status: 403 })
    }

    // 상점 거부
    const updatedStore = await prisma.store.update({
      where: { id: storeId },
      data: {
        approvalStatus: 'REJECTED',
        approvedBy: userId,
        rejectionReason: reason,
      },
    })

    return NextResponse.json({
      success: true,
      message: '상점 가입이 거부되었습니다.',
      data: updatedStore,
    })
  } catch (error) {
    console.error('Store rejection error:', error)
    return NextResponse.json(
      {
        error: 'Failed to reject store',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
