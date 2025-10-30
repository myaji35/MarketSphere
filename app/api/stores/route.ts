import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserId } from '@/lib/get-user-id'
import { generateSubdomain, ensureUniqueSubdomain, getFullDomain } from '@/lib/subdomain'

export async function POST(request: Request) {
  try {
    // 1. 사용자 인증 확인
    const userId = await getUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. 요청 데이터 파싱
    const body = await request.json()
    const { storeName, category, marketId, location, phone, hours, photoUrl, description } = body

    // 3. 필수 필드 검증
    if (!storeName || !category || !marketId || !phone) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // 4. 시장 존재 확인
    const market = await prisma.market.findUnique({
      where: { id: marketId },
    })

    if (!market) {
      return NextResponse.json({ error: 'Market not found' }, { status: 404 })
    }

    // 5. 서브도메인 생성
    const baseSubdomain = generateSubdomain(storeName)

    // 6. 기존 서브도메인 조회 (같은 시장 내)
    const existingStores = await prisma.store.findMany({
      where: { marketId },
      select: { subdomain: true },
    })

    const existingSubdomains = existingStores.map((s) => s.subdomain)

    // 7. 중복 확인 및 유니크 서브도메인 생성
    const uniqueSubdomain = ensureUniqueSubdomain(baseSubdomain, existingSubdomains)

    // 8. 전체 도메인 생성
    const fullDomain = getFullDomain(uniqueSubdomain, market.subdomainPrefix)

    // 9. 사용자 생성 또는 업데이트 (Clerk 연동)
    const user = await prisma.user.upsert({
      where: { id: userId },
      update: {},
      create: {
        id: userId,
        role: 'MERCHANT',
      },
    })

    // 10. 상점 생성
    const store = await prisma.store.create({
      data: {
        storeName,
        subdomain: uniqueSubdomain,
        marketId,
        ownerId: user.id,
        category,
        location,
        phone,
        hours,
        photoUrl,
        description,
        approvalStatus: 'PENDING', // 승인 대기 상태
      },
    })

    // 11. 응답
    return NextResponse.json({
      success: true,
      store: {
        id: store.id,
        storeName: store.storeName,
        subdomain: store.subdomain,
        fullDomain,
        approvalStatus: store.approvalStatus,
        createdAt: store.createdAt,
      },
      message: '가입 신청이 완료되었습니다. 상인회 승인을 기다려주세요 (1~2영업일)',
    })
  } catch (error) {
    console.error('Store creation error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    // 사용자의 상점 목록 조회
    const userId = await getUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const stores = await prisma.store.findMany({
      where: { ownerId: userId },
      include: {
        market: {
          select: {
            marketName: true,
            subdomainPrefix: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ stores })
  } catch (error) {
    console.error('Store fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
