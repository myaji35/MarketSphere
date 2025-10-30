import { NextRequest, NextResponse } from 'next/server'
import { enhanceProductImage } from '@/lib/ai/openai'
import { getUserId } from '@/lib/get-user-id'

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserId()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { imageUrl } = body

    if (!imageUrl) {
      return NextResponse.json({ error: 'Image URL is required' }, { status: 400 })
    }

    // 이미지 분석 및 개선 제안
    const analysis = await enhanceProductImage(imageUrl)

    return NextResponse.json({
      success: true,
      data: analysis,
    })
  } catch (error) {
    console.error('Error in enhance-image API:', error)
    return NextResponse.json({ error: 'Failed to analyze image' }, { status: 500 })
  }
}
