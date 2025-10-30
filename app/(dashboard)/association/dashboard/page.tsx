'use client'

import { useEffect, useState } from 'react'
import { StatsCard } from '@/components/dashboard/stats-card'
import { CategoryChart } from '@/components/dashboard/category-chart'
import { TopStoresTable } from '@/components/dashboard/top-stores-table'
import { PendingApprovalsTable } from '@/components/dashboard/pending-approvals-table'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Store, TrendingUp, Clock, XCircle, RefreshCw } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface DashboardData {
  market: {
    id: string
    name: string
    totalStores: number
    address: string | null
  }
  overview: {
    totalStores: number
    approvedStores: number
    pendingStores: number
    rejectedStores: number
    suspendedStores: number
  }
  timeSales: {
    total: number
    active: number
    period: string
  }
  topStores: Array<{
    id: string
    name: string
    category: string
    productsCount: number
    timeSalesCount: number
    approvalStatus: string
  }>
  pendingApprovals: Array<{
    id: string
    storeName: string
    category: string
    phone: string
    location: string
    createdAt: string
    owner: {
      name: string | null
      email: string | null
      phone: string | null
    }
  }>
  categoryDistribution: Array<{
    category: string
    count: number
  }>
}

export default function AssociationDashboardPage() {
  const { toast } = useToast()
  const [data, setData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [period, setPeriod] = useState('week')
  const [marketId, setMarketId] = useState('mangwon-market') // TODO: 실제로는 사용자 권한에서 가져와야 함

  const fetchDashboardData = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(
        `/api/association/dashboard?marketId=${marketId}&period=${period}`
      )

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data')
      }

      const result = await response.json()
      setData(result.data)
    } catch (error) {
      console.error('Dashboard fetch error:', error)
      toast({
        title: '데이터 로드 실패',
        description: '대시보드 데이터를 불러오는데 실패했습니다.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [marketId, period])

  const handleApprove = async (storeId: string) => {
    try {
      const response = await fetch(`/api/association/stores/${storeId}/approve`, {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Failed to approve store')
      }

      toast({
        title: '승인 완료',
        description: '상점 가입이 승인되었습니다.',
      })

      // 데이터 새로고침
      fetchDashboardData()
    } catch (error) {
      console.error('Approve error:', error)
      toast({
        title: '승인 실패',
        description: '상점 승인 중 오류가 발생했습니다.',
        variant: 'destructive',
      })
    }
  }

  const handleReject = async (storeId: string, reason: string) => {
    try {
      const response = await fetch(`/api/association/stores/${storeId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      })

      if (!response.ok) {
        throw new Error('Failed to reject store')
      }

      toast({
        title: '거부 완료',
        description: '상점 가입이 거부되었습니다.',
      })

      // 데이터 새로고침
      fetchDashboardData()
    } catch (error) {
      console.error('Reject error:', error)
      toast({
        title: '거부 실패',
        description: '상점 거부 중 오류가 발생했습니다.',
        variant: 'destructive',
      })
    }
  }

  if (isLoading || !data) {
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
          <h1 className="text-3xl font-bold">{data.market.name} 대시보드</h1>
          <p className="text-muted-foreground mt-1">{data.market.address}</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">오늘</SelectItem>
              <SelectItem value="week">이번 주</SelectItem>
              <SelectItem value="month">이번 달</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={fetchDashboardData}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="전체 상점"
          value={data.overview.totalStores}
          description="등록된 상점 수"
          icon={Store}
        />
        <StatsCard
          title="승인된 상점"
          value={data.overview.approvedStores}
          description="영업 중인 상점"
          icon={TrendingUp}
        />
        <StatsCard
          title="승인 대기"
          value={data.overview.pendingStores}
          description="처리가 필요합니다"
          icon={Clock}
        />
        <StatsCard
          title="활성 타임세일"
          value={data.timeSales.active}
          description={`총 ${data.timeSales.total}건 진행됨`}
          icon={TrendingUp}
        />
      </div>

      {/* 승인 대기 상점 */}
      {data.pendingApprovals.length > 0 && (
        <PendingApprovalsTable
          stores={data.pendingApprovals}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}

      {/* 차트 및 테이블 */}
      <div className="grid gap-4 md:grid-cols-2">
        <CategoryChart data={data.categoryDistribution} />
        <TopStoresTable stores={data.topStores} />
      </div>
    </div>
  )
}
