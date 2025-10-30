'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'

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

interface CampaignHistoryProps {
  campaigns: Campaign[]
}

export function CampaignHistory({ campaigns }: CampaignHistoryProps) {
  const getTargetAudienceLabel = (targetAudience: string) => {
    const labels: Record<string, string> = {
      ALL: '전체',
      FAVORITES_ONLY: '단골',
      AGE_RANGE: '연령대',
      LOCATION_BASED: '위치',
    }
    return labels[targetAudience] || targetAudience
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      SENT: 'default',
      SCHEDULED: 'secondary',
      DRAFT: 'outline',
      CANCELLED: 'destructive',
      FAILED: 'destructive',
    }
    const labels: Record<string, string> = {
      SENT: '발송완료',
      SCHEDULED: '예약됨',
      DRAFT: '작성중',
      CANCELLED: '취소됨',
      FAILED: '실패',
    }
    return (
      <Badge variant={variants[status] || 'outline'} className="text-xs">
        {labels[status] || status}
      </Badge>
    )
  }

  const getSuccessRate = (successCount: number, targetCount: number) => {
    if (targetCount === 0) return '0%'
    return `${Math.round((successCount / targetCount) * 100)}%`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>발송 이력</CardTitle>
        <CardDescription>최근 50개의 마케팅 캠페인</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>제목</TableHead>
              <TableHead>메시지</TableHead>
              <TableHead className="text-center">대상</TableHead>
              <TableHead className="text-right">타겟</TableHead>
              <TableHead className="text-right">성공</TableHead>
              <TableHead className="text-right">성공률</TableHead>
              <TableHead className="text-center">상태</TableHead>
              <TableHead className="text-right">발송일</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {campaigns.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                  발송 이력이 없습니다
                </TableCell>
              </TableRow>
            ) : (
              campaigns.map((campaign) => (
                <TableRow key={campaign.id}>
                  <TableCell className="font-medium max-w-[200px] truncate">
                    {campaign.title}
                  </TableCell>
                  <TableCell className="max-w-[300px] truncate text-sm text-muted-foreground">
                    {campaign.message}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className="text-xs">
                      {getTargetAudienceLabel(campaign.targetAudience)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">{campaign.targetCount}명</TableCell>
                  <TableCell className="text-right">
                    <span className="text-green-600 font-medium">{campaign.successCount}</span>
                    {campaign.failureCount > 0 && (
                      <span className="text-red-500 text-sm ml-1">(-{campaign.failureCount})</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <span
                      className={
                        parseInt(getSuccessRate(campaign.successCount, campaign.targetCount)) >= 90
                          ? 'text-green-600 font-medium'
                          : parseInt(getSuccessRate(campaign.successCount, campaign.targetCount)) >=
                              70
                            ? 'text-yellow-600 font-medium'
                            : 'text-red-500 font-medium'
                      }
                    >
                      {getSuccessRate(campaign.successCount, campaign.targetCount)}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">{getStatusBadge(campaign.status)}</TableCell>
                  <TableCell className="text-right text-sm text-muted-foreground">
                    {campaign.sentAt
                      ? formatDistanceToNow(new Date(campaign.sentAt), {
                          addSuffix: true,
                          locale: ko,
                        })
                      : '-'}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
