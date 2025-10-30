'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, Send } from 'lucide-react'

interface CampaignFormProps {
  marketId: string
  marketName: string
  onSuccess: () => void
}

export function CampaignForm({ marketId, marketName, onSuccess }: CampaignFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [targetAudience, setTargetAudience] = useState<string>('ALL')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim() || !message.trim()) {
      alert('제목과 메시지를 입력해주세요')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/association/marketing/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          marketId,
          title,
          message,
          targetAudience,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to send campaign')
      }

      const result = await response.json()

      alert(
        `푸시 알림이 발송되었습니다!\n\n` +
          `대상: ${result.data.targetCount}명\n` +
          `성공: ${result.data.successCount}명\n` +
          `실패: ${result.data.failureCount}명`
      )

      // 폼 초기화
      setTitle('')
      setMessage('')
      setTargetAudience('ALL')

      onSuccess()
    } catch (error) {
      console.error('Campaign send error:', error)
      alert('푸시 알림 발송에 실패했습니다')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>새 마케팅 캠페인</CardTitle>
        <CardDescription>{marketName} 고객에게 푸시 알림을 발송합니다</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 제목 */}
          <div className="space-y-2">
            <Label htmlFor="title">제목 *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: 주말 특별 할인 이벤트"
              maxLength={50}
              required
            />
            <p className="text-sm text-muted-foreground">{title.length}/50자</p>
          </div>

          {/* 메시지 */}
          <div className="space-y-2">
            <Label htmlFor="message">메시지 *</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="예: 이번 주말 전 상점 20% 할인! 놓치지 마세요!"
              rows={4}
              maxLength={200}
              required
            />
            <p className="text-sm text-muted-foreground">{message.length}/200자</p>
          </div>

          {/* 타겟 선택 */}
          <div className="space-y-2">
            <Label htmlFor="target">대상 고객</Label>
            <Select value={targetAudience} onValueChange={setTargetAudience}>
              <SelectTrigger id="target">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">전체 고객</SelectItem>
                <SelectItem value="FAVORITES_ONLY">단골 고객만</SelectItem>
                <SelectItem value="AGE_RANGE">연령대별 (준비중)</SelectItem>
                <SelectItem value="LOCATION_BASED">위치 기반 (준비중)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              {targetAudience === 'ALL'
                ? '시장 내 모든 상점을 단골 등록한 고객'
                : targetAudience === 'FAVORITES_ONLY'
                  ? '2개 이상의 상점을 단골로 등록한 고객'
                  : targetAudience === 'AGE_RANGE'
                    ? '특정 연령대의 고객 (향후 지원 예정)'
                    : '시장 근처에 사는 고객 (향후 지원 예정)'}
            </p>
          </div>

          {/* 제출 버튼 */}
          <div className="flex items-center gap-4 pt-4">
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  발송 중...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  즉시 발송
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
