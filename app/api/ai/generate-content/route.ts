import { NextRequest, NextResponse } from 'next/server'
import { generateMarketingContent } from '@/lib/ai/openai'
import { prisma } from '@/lib/prisma'
import { getUserId } from '@/lib/get-user-id'

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserId()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { imageUrl, storeId } = body

    if (!imageUrl) {
      return NextResponse.json({ error: 'Image URL is required' }, { status: 400 })
    }

    // 상점 소유권 확인 (선택적)
    if (storeId) {
      const store = await prisma.store.findFirst({
        where: {
          id: storeId,
          ownerId: userId,
        },
      })

      if (!store) {
        return NextResponse.json({ error: 'Store not found or unauthorized' }, { status: 403 })
      }
    }

    // AI 콘텐츠 생성
    const result = await generateMarketingContent(imageUrl)

    return NextResponse.json({
      success: true,
      data: result,
    })
  } catch (error) {
    console.error('Error in generate-content API:', error)
    return NextResponse.json({ error: 'Failed to generate content' }, { status: 500 })
  }
}
