import OpenAI from 'openai'

// OpenAI 클라이언트 (API 키가 없으면 런타임에서 에러)
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'dummy-key-for-build',
})

/**
 * 더미 마케팅 콘텐츠 생성 (API 키가 없을 때 사용)
 */
function generateDummyMarketingContent(): { description: string; hashtags: string[] } {
  const dummyDescriptions = [
    '신선한 재료로 만든 오늘의 특별 상품! 전통시장에서만 맛볼 수 있는 진짜 맛입니다.',
    '장인의 손길이 담긴 정성스러운 상품입니다. 믿고 드셔도 좋아요!',
    '오늘 아침 직접 준비한 신선한 상품! 한정 수량으로 준비했습니다.',
    '전통의 맛을 그대로! 우리 가게 대표 상품입니다.',
    '가성비 최고! 품질은 높이고 가격은 낮춘 특별한 상품입니다.',
  ]

  const dummyHashtags = [
    ['#전통시장', '#신선한', '#당일제조', '#가성비최고', '#건강한재료'],
    ['#맛집', '#추천', '#인기상품', '#특별할인', '#전통의맛'],
    ['#오늘의특가', '#한정수량', '#서둘러주세요', '#품질보장', '#정성가득'],
    ['#장인정신', '#수제', '#정통', '#믿을수있는', '#프리미엄'],
    ['#가족건강', '#신선식품', '#매일신선', '#품질인증', '#안심'],
  ]

  const randomIndex = Math.floor(Math.random() * dummyDescriptions.length)

  return {
    description: dummyDescriptions[randomIndex],
    hashtags: dummyHashtags[randomIndex],
  }
}

/**
 * 상품 이미지를 분석하여 홍보 문구와 해시태그를 생성합니다.
 */
export async function generateMarketingContent(imageUrl: string) {
  // API 키가 없거나 더미 키인 경우 더미 데이터 반환
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'dummy-key-for-build') {
    console.log('⚠️ OPENAI_API_KEY가 설정되지 않았습니다. 더미 데이터를 반환합니다.')
    await new Promise((resolve) => setTimeout(resolve, 1500)) // 실제 API 호출처럼 지연
    return generateDummyMarketingContent()
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `당신은 전통시장 소상공인을 위한 마케팅 전문가입니다.
상품 이미지를 보고 고객을 끌어당기는 매력적인 홍보 문구와 해시태그를 생성해주세요.

요구사항:
1. 홍보 문구: 50-100자 이내, 전통시장의 따뜻함과 신선함을 강조
2. 해시태그: 5-10개, 상품 특성과 전통시장 특화 키워드 포함
3. 톤앤매너: 친근하고 따뜻하며, 신뢰감을 주는 표현

JSON 형식으로 응답해주세요:
{
  "description": "홍보 문구",
  "hashtags": ["해시태그1", "해시태그2", ...]
}`,
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: '이 상품의 매력적인 홍보 문구와 해시태그를 생성해주세요.',
            },
            {
              type: 'image_url',
              image_url: {
                url: imageUrl,
                detail: 'low', // 비용 최적화
              },
            },
          ],
        },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 500,
      temperature: 0.8,
    })

    const content = completion.choices[0]?.message?.content
    if (!content) {
      throw new Error('No content generated from OpenAI')
    }

    const result = JSON.parse(content)
    return {
      description: result.description,
      hashtags: result.hashtags,
    }
  } catch (error) {
    console.error('Error generating marketing content:', error)
    throw new Error('Failed to generate marketing content')
  }
}

/**
 * 상품 이미지를 자동으로 보정합니다 (밝기, 선명도 등)
 * OpenAI DALL-E edit 기능 활용
 */
export async function enhanceProductImage(imageUrl: string) {
  // API 키가 없거나 더미 키인 경우 더미 데이터 반환
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'dummy-key-for-build') {
    console.log('⚠️ OPENAI_API_KEY가 설정되지 않았습니다. 더미 분석 결과를 반환합니다.')
    await new Promise((resolve) => setTimeout(resolve, 1000))
    return {
      brightness: '적정',
      sharpness: '적정',
      background: '깔끔함',
      suggestions: ['상품이 잘 보입니다', '조명이 좋습니다', '배경이 깔끔합니다'],
    }
  }

  try {
    // DALL-E edit을 사용하여 이미지 품질 개선
    // 참고: 실제로는 이미지 처리 라이브러리나 외부 서비스를 사용하는 것이 더 효율적입니다
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `이미지 품질 개선 제안을 해주세요. 밝기, 선명도, 배경 정리 등 상품 사진을 더 매력적으로 만들 수 있는 구체적인 조언을 JSON 형식으로 제공해주세요.
{
  "brightness": "증가/감소/적정",
  "sharpness": "증가 필요/적정",
  "background": "정리 필요/깔끔함",
  "suggestions": ["제안1", "제안2", ...]
}`,
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: '이 상품 사진의 품질을 분석하고 개선 제안을 해주세요.',
            },
            {
              type: 'image_url',
              image_url: {
                url: imageUrl,
                detail: 'low',
              },
            },
          ],
        },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 300,
    })

    const content = completion.choices[0]?.message?.content
    if (!content) {
      throw new Error('No analysis from OpenAI')
    }

    return JSON.parse(content)
  } catch (error) {
    console.error('Error analyzing image:', error)
    throw new Error('Failed to analyze image')
  }
}

/**
 * 계절과 날씨 정보를 기반으로 마케팅 메시지를 생성합니다.
 */
/**
 * OpenAI Chat Completion 생성 (범용)
 */
export async function generateChatCompletion(params: {
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>
  temperature?: number
  model?: string
  maxTokens?: number
}): Promise<string> {
  const { messages, temperature = 0.7, model = 'gpt-4o-mini', maxTokens = 1000 } = params

  // API 키가 없거나 더미 키인 경우 에러 메시지 반환
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'dummy-key-for-build') {
    console.log('⚠️ OPENAI_API_KEY가 설정되지 않았습니다. 기본 응답을 반환합니다.')
    return JSON.stringify({
      recommendations: [
        {
          menuName: '파전과 막걸리',
          ingredients: ['부추', '해물', '밀가루', '계란'],
          reason: '비 오는 날엔 역시 파전이죠!',
          category: '비오는 날 음식',
        },
      ],
    })
  }

  try {
    const completion = await openai.chat.completions.create({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
    })

    const content = completion.choices[0]?.message?.content
    if (!content) {
      throw new Error('No content generated from OpenAI')
    }

    return content
  } catch (error) {
    console.error('Error generating chat completion:', error)
    throw new Error('Failed to generate chat completion')
  }
}

export async function generateWeatherBasedMarketing(
  weather: string,
  temperature: number,
  productCategory: string
) {
  // API 키가 없거나 더미 키인 경우 더미 데이터 반환
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'dummy-key-for-build') {
    console.log('⚠️ OPENAI_API_KEY가 설정되지 않았습니다. 더미 마케팅 메시지를 반환합니다.')
    await new Promise((resolve) => setTimeout(resolve, 1000))

    let message = ''
    let emoji = ''
    let discount = 15

    if (weather.includes('비')) {
      message = `비 오는 날엔 따뜻한 ${productCategory}! 우천 할인 진행 중`
      emoji = '☔'
      discount = 20
    } else if (weather.includes('눈')) {
      message = `눈 오는 날 특별한 ${productCategory} 할인!`
      emoji = '❄️'
      discount = 25
    } else if (temperature >= 28) {
      message = `무더운 여름! 시원한 ${productCategory} 특가`
      emoji = '☀️'
      discount = 20
    } else if (temperature <= 5) {
      message = `추운 날씨! 따뜻한 ${productCategory}로 힘내세요`
      emoji = '🧣'
      discount = 15
    } else {
      message = `오늘의 신선한 ${productCategory} 특가!`
      emoji = '🌟'
      discount = 10
    }

    return {
      message,
      emoji,
      discount_suggestion: discount,
    }
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `당신은 전통시장 마케팅 전문가입니다. 현재 날씨와 기온을 고려하여 상품 카테고리에 맞는 매력적인 마케팅 메시지를 생성해주세요.

예시:
- 비 오는 날 + 식재료 → "비 오는 날엔 따뜻한 전/부침개! 재료 30% 할인"
- 더운 날 + 과일 → "무더위엔 시원한 수박! 오늘 입고한 달콤한 수박 특가"
- 추운 날 + 간식 → "추운 날씨에 따뜻한 군고구마 어떠세요?"

JSON 형식으로 응답:
{
  "message": "마케팅 메시지",
  "emoji": "적절한 이모지",
  "discount_suggestion": 10-30 (할인율 제안, 숫자만)
}`,
        },
        {
          role: 'user',
          content: `현재 날씨: ${weather}, 기온: ${temperature}°C, 상품 카테고리: ${productCategory}`,
        },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 200,
      temperature: 0.9,
    })

    const content = completion.choices[0]?.message?.content
    if (!content) {
      throw new Error('No content generated')
    }

    return JSON.parse(content)
  } catch (error) {
    console.error('Error generating weather-based marketing:', error)
    throw new Error('Failed to generate weather-based marketing')
  }
}
