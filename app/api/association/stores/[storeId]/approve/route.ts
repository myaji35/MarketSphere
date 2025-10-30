import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserId } from '@/lib/get-user-id'

/**
 * 상점 승인 API
 * POST /api/association/stores/[storeId]/approve
 */
export async function POST(req: NextRequest, { params }: { params: { storeId: string } }) {
  try {
    const userId = await getUserId()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { storeId } = params

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

    // 상점 승인
    const updatedStore = await prisma.store.update({
      where: { id: storeId },
      data: {
        approvalStatus: 'APPROVED',
        approvedAt: new Date(),
        approvedBy: userId,
        rejectionReason: null,
      },
    })

    return NextResponse.json({
      success: true,
      message: '상점이 승인되었습니다.',
      data: updatedStore,
    })
  } catch (error) {
    console.error('Store approval error:', error)
    return NextResponse.json(
      {
        error: 'Failed to approve store',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
