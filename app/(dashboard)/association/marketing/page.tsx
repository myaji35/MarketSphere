'use client'

import { useEffect, useState } from 'react'
import { CampaignForm } from '@/components/marketing/campaign-form'
import { CampaignHistory } from '@/components/marketing/campaign-history'
import { StatsCard } from '@/components/dashboard/stats-card'
import { Megaphone, Users, CheckCircle, XCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

interface Campaign {
  id: string
  title: string
  message: string
  targetAudience: string
  status: string
  targetCount: number
  successCount: number
  failureCount: number
  createdAt: string
  sentAt: string | null
}

export default function MarketingPage() {
  const { toast } = useToast()
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [marketId] = useState('mangwon-market') // TODO: 실제로는 사용자 권한에서 가져와야 함
  const [marketName] = useState('망원시장') // TODO: 실제로는 API에서 가져와야 함

  const fetchCampaigns = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/association/marketing/broadcast?marketId=${marketId}`)

      if (!response.ok) {
        throw new Error('Failed to fetch campaigns')
      }

      const result = await response.json()
      setCampaigns(result.data)
    } catch (error) {
      console.error('Campaign fetch error:', error)
      toast({
        title: '데이터 로드 실패',
        description: '캠페인 이력을 불러오는데 실패했습니다.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCampaigns()
  }, [marketId])

  const handleCampaignSuccess = () => {
    fetchCampaigns()
  }

  // 통계 계산
  const totalCampaigns = campaigns.length
  const totalTargetCount = campaigns.reduce((sum, c) => sum + c.targetCount, 0)
  const totalSuccessCount = campaigns.reduce((sum, c) => sum + c.successCount, 0)
  const totalFailureCount = campaigns.reduce((sum, c) => sum + c.failureCount, 0)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">데이터를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">마케팅 캠페인</h1>
          <p className="text-muted-foreground mt-1">{marketName} 전체 푸시 알림 발송</p>
        </div>
        <Button variant="outline" size="icon" onClick={fetchCampaigns}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* 통계 카드 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="총 캠페인"
          value={totalCampaigns}
          description="발송한 캠페인 수"
          icon={Megaphone}
        />
        <StatsCard
          title="총 타겟"
          value={totalTargetCount}
          description="전체 대상자"
          icon={Users}
        />
        <StatsCard
          title="성공"
          value={totalSuccessCount}
          description="성공적으로 발송됨"
          icon={CheckCircle}
        />
        <StatsCard title="실패" value={totalFailureCount} description="발송 실패" icon={XCircle} />
      </div>

      {/* 캠페인 폼 */}
      <CampaignForm marketId={marketId} marketName={marketName} onSuccess={handleCampaignSuccess} />

      {/* 발송 이력 */}
      <CampaignHistory campaigns={campaigns} />
    </div>
  )
}
