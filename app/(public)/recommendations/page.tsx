'use client'

import { useEffect, useState } from 'react'
import { RecommendationCard } from '@/components/recommendations/recommendation-card'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Cloud, Sun, CloudRain, Snowflake, RefreshCw, Loader2 } from 'lucide-react'

interface Product {
  id: string
  productName: string
  price: number
  storeName: string
  storeCategory: string
}

interface Recommendation {
  menuName: string
  ingredients: string[]
  reason: string
  category: string
  matchedProducts: Product[]
}

interface RecommendationData {
  context: {
    weather: string
    temperature: number
    season: string
    timeOfDay: string
    marketName: string
  }
  recommendations: Recommendation[]
}

export default function RecommendationsPage() {
  const [data, setData] = useState<RecommendationData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [marketId] = useState('mangwon-market') // TODO: 실제로는 사용자 위치 기반으로 가져와야 함

  const fetchRecommendations = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/ai/recommendations?marketId=${marketId}`)

      if (!response.ok) {
        throw new Error('Failed to fetch recommendations')
      }

      const result = await response.json()
      setData(result.data)
    } catch (error) {
      console.error('Recommendations fetch error:', error)
      alert('추천을 불러오는데 실패했습니다')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchRecommendations()
  }, [marketId])

  const getWeatherIcon = (weather: string) => {
    if (weather.includes('비')) return <CloudRain className="h-6 w-6 text-blue-500" />
    if (weather.includes('눈')) return <Snowflake className="h-6 w-6 text-blue-300" />
    if (weather.includes('흐림')) return <Cloud className="h-6 w-6 text-gray-500" />
    return <Sun className="h-6 w-6 text-yellow-500" />
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">AI가 맞춤 추천을 생성하는 중...</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">추천을 불러올 수 없습니다</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* 헤더 */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold">오늘의 AI 추천</h1>
          <p className="text-muted-foreground">날씨와 계절을 고려한 맞춤형 장보기 리스트</p>
        </div>

        {/* 현재 상황 카드 */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {getWeatherIcon(data.context.weather)}
                <div>
                  <h3 className="font-semibold">{data.context.marketName}</h3>
                  <p className="text-sm text-muted-foreground">
                    {data.context.weather} • {data.context.temperature}°C • {data.context.season} •{' '}
                    {data.context.timeOfDay}
                  </p>
                </div>
              </div>
              <Button variant="outline" size="icon" onClick={fetchRecommendations}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 추천 리스트 */}
        <div className="space-y-4">
          {data.recommendations.map((rec, idx) => (
            <RecommendationCard
              key={idx}
              menuName={rec.menuName}
              ingredients={rec.ingredients}
              reason={rec.reason}
              category={rec.category}
              matchedProducts={rec.matchedProducts}
            />
          ))}
        </div>

        {/* AI 안내 */}
        <Card className="bg-muted/50 border-dashed">
          <CardContent className="p-6 text-center">
            <p className="text-sm text-muted-foreground">
              이 추천은 AI가 현재 날씨, 계절, 시간대를 분석하여 생성한 맞춤형 제안입니다.
              <br />
              추천을 새로고침하면 다른 메뉴를 제안받을 수 있습니다.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
