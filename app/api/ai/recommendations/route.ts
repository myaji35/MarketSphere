import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getWeatherByCity } from '@/lib/weather'
import { generateChatCompletion } from '@/lib/ai/openai'

/**
 * AI 개인화 추천 API
 * GET /api/ai/recommendations?marketId={marketId}&userId={userId}
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const marketId = searchParams.get('marketId')
    const userId = searchParams.get('userId') || 'guest'

    if (!marketId) {
      return NextResponse.json({ error: 'marketId is required' }, { status: 400 })
    }

    // 시장 정보 조회
    const market = await prisma.market.findUnique({
      where: { id: marketId },
      include: {
        stores: {
          where: { approvalStatus: 'APPROVED' },
          include: {
            products: {
              where: { isAvailable: true },
              take: 5,
              orderBy: { createdAt: 'desc' },
            },
          },
          take: 20,
        },
      },
    })

    if (!market) {
      return NextResponse.json({ error: 'Market not found' }, { status: 404 })
    }

    // 날씨 정보 조회
    const weather = await getWeatherByCity('Seoul')

    // 현재 시간대 및 계절 정보
    const now = new Date()
    const hour = now.getHours()
    const month = now.getMonth() + 1
    const season = getSeason(month)
    const timeOfDay = getTimeOfDay(hour)

    // 사용자 단골 상점 조회 (게스트가 아닌 경우)
    let favoriteStores: string[] = []
    if (userId !== 'guest') {
      const favorites = await prisma.favorite.findMany({
        where: { userId },
        include: {
          store: {
            select: {
              storeName: true,
              category: true,
            },
          },
        },
        take: 5,
      })
      favoriteStores = favorites.map((f) => `${f.store.storeName} (${f.store.category})`)
    }

    // AI 프롬프트 생성
    const prompt = `당신은 전통시장 장보기 도우미입니다. 다음 정보를 바탕으로 고객에게 맞춤형 추천을 제공해주세요.

**시장 정보**:
- 시장명: ${market.marketName}
- 위치: ${market.address || '정보 없음'}
- 등록된 상점 수: ${market.stores.length}개

**현재 상황**:
- 날씨: ${weather.weather} (${weather.temperature}°C)
- 계절: ${season}
- 시간대: ${timeOfDay}

**사용자 정보**:
${userId !== 'guest' ? `- 단골 상점: ${favoriteStores.join(', ')}` : '- 첫 방문 고객'}

**추천 요청**:
1. 현재 날씨와 계절을 고려한 장보기 리스트 3가지 (각 리스트는 메뉴명과 필요한 재료 포함)
2. 각 추천 항목에 대해 간단한 설명 (왜 지금 추천하는지)

응답은 다음 JSON 형식으로 해주세요:
{
  "recommendations": [
    {
      "menuName": "메뉴명",
      "ingredients": ["재료1", "재료2", "재료3"],
      "reason": "추천 이유 (1-2문장)",
      "category": "카테고리 (예: 따뜻한 음식, 시원한 음식, 비오는 날 음식 등)"
    }
  ]
}
`

    // OpenAI API 호출
    const aiResponse = await generateChatCompletion({
      messages: [
        {
          role: 'system',
          content:
            '당신은 전통시장 장보기 전문가입니다. 날씨, 계절, 시간대를 고려하여 실용적인 추천을 제공합니다.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.8,
      model: 'gpt-4o-mini',
    })

    // AI 응답 파싱
    let aiRecommendations
    try {
      // JSON 추출 (코드 블록 제거)
      const jsonMatch =
        aiResponse.match(/```json\n([\s\S]*?)\n```/) || aiResponse.match(/\{[\s\S]*\}/)
      const jsonString = jsonMatch ? jsonMatch[1] || jsonMatch[0] : aiResponse
      aiRecommendations = JSON.parse(jsonString)
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError)
      // 파싱 실패 시 기본 추천
      aiRecommendations = getDefaultRecommendations(weather.weather, season)
    }

    // 추천 상품 매칭
    const recommendationsWithProducts = aiRecommendations.recommendations.map(
      (rec: { menuName: string; ingredients: string[]; reason: string; category: string }) => {
        // 추천된 재료와 일치하는 상품 찾기
        const matchedProducts = market.stores
          .flatMap((store) =>
            store.products.map((product) => ({
              ...product,
              storeName: store.storeName,
              storeId: store.id,
              storeCategory: store.category,
            }))
          )
          .filter((product) =>
            rec.ingredients.some((ingredient) => product.productName.includes(ingredient))
          )
          .slice(0, 3)

        return {
          ...rec,
          matchedProducts,
        }
      }
    )

    return NextResponse.json({
      success: true,
      data: {
        context: {
          weather: weather.weather,
          temperature: weather.temperature,
          season,
          timeOfDay,
          marketName: market.marketName,
        },
        recommendations: recommendationsWithProducts,
      },
    })
  } catch (error) {
    console.error('AI recommendations error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * 계절 판단
 */
function getSeason(month: number): string {
  if (month >= 3 && month <= 5) return '봄'
  if (month >= 6 && month <= 8) return '여름'
  if (month >= 9 && month <= 11) return '가을'
  return '겨울'
}

/**
 * 시간대 판단
 */
function getTimeOfDay(hour: number): string {
  if (hour >= 5 && hour < 11) return '아침'
  if (hour >= 11 && hour < 14) return '점심'
  if (hour >= 14 && hour < 18) return '오후'
  if (hour >= 18 && hour < 22) return '저녁'
  return '밤'
}

/**
 * 기본 추천 (AI 파싱 실패 시 사용)
 */
function getDefaultRecommendations(weather: string, season: string) {
  const recommendations = []

  if (weather === '비' || weather === '이슬비') {
    recommendations.push({
      menuName: '파전과 막걸리',
      ingredients: ['부추', '해물', '밀가루', '계란'],
      reason: '비 오는 날엔 역시 파전이죠! 바삭한 파전과 시원한 막걸리로 운치를 더하세요.',
      category: '비오는 날 음식',
    })
  }

  if (season === '여름') {
    recommendations.push({
      menuName: '시원한 콩국수',
      ingredients: ['콩', '오이', '토마토', '소면'],
      reason: '무더운 여름, 영양 만점 콩국수로 더위를 식혀보세요.',
      category: '시원한 음식',
    })
  } else if (season === '겨울') {
    recommendations.push({
      menuName: '따뜻한 된장찌개',
      ingredients: ['된장', '두부', '감자', '대파', '양파'],
      reason: '추운 겨울엔 뜨끈한 된장찌개가 제격입니다.',
      category: '따뜻한 음식',
    })
  }

  recommendations.push({
    menuName: '제철 과일 샐러드',
    ingredients: ['사과', '배', '키위', '방울토마토'],
    reason: '신선한 제철 과일로 건강한 한 끼 준비하세요.',
    category: '건강식',
  })

  return { recommendations }
}
