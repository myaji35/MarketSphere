import { NextRequest, NextResponse } from 'next/server'
import { generateWeatherBasedMarketing } from '@/lib/ai/openai'
import { getUserId } from '@/lib/get-user-id'

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserId()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { weather, temperature, productCategory } = body

    if (!weather || temperature === undefined || !productCategory) {
      return NextResponse.json(
        { error: 'Weather, temperature, and product category are required' },
        { status: 400 }
      )
    }

    // 날씨 기반 마케팅 메시지 생성
    const result = await generateWeatherBasedMarketing(weather, temperature, productCategory)

    return NextResponse.json({
      success: true,
      data: result,
    })
  } catch (error) {
    console.error('Error in weather-marketing API:', error)
    return NextResponse.json(
      { error: 'Failed to generate weather-based marketing' },
      { status: 500 }
    )
  }
}
