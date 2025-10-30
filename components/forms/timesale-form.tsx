'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Bell } from 'lucide-react'

interface TimeSaleFormProps {
  storeId: string
}

export function TimeSaleForm({ storeId }: TimeSaleFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [sendPushNotification, setSendPushNotification] = useState(true)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    discountRate: '',
    startTime: '',
    endTime: '',
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title || !formData.discountRate || !formData.startTime || !formData.endTime) {
      toast({
        title: '필수 항목을 입력해주세요',
        description: '제목, 할인율, 시작/종료 시간은 필수 항목입니다.',
        variant: 'destructive',
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/timesales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          storeId,
          discountRate: parseInt(formData.discountRate),
          startTime: new Date(formData.startTime).toISOString(),
          endTime: new Date(formData.endTime).toISOString(),
          sendPushNotification,
        }),
      })

      if (!response.ok) {
        throw new Error('타임세일 생성에 실패했습니다')
      }

      const result = await response.json()

      toast({
        title: '타임세일 시작!',
        description: sendPushNotification
          ? '타임세일이 시작되었고, 단골 고객에게 알림이 발송되었습니다.'
          : '타임세일이 시작되었습니다.',
      })

      router.push('/merchant/timesales')
      router.refresh()
    } catch (error) {
      console.error('Error creating time sale:', error)
      toast({
        title: '타임세일 생성 실패',
        description: '잠시 후 다시 시도해주세요.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  // 현재 시간으로부터 적절한 기본값 설정
  const getDefaultStartTime = () => {
    const now = new Date()
    now.setMinutes(now.getMinutes() - (now.getMinutes() % 30)) // 30분 단위로 반올림
    return now.toISOString().slice(0, 16)
  }

  const getDefaultEndTime = () => {
    const later = new Date()
    later.setHours(later.getHours() + 2)
    later.setMinutes(later.getMinutes() - (later.getMinutes() % 30))
    return later.toISOString().slice(0, 16)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>타임세일 정보</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">타임세일 제목 *</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="예: 신선한 과일 30% 할인!"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">설명</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="타임세일에 대한 상세 설명을 입력하세요"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="discountRate">할인율 (%) *</Label>
            <Input
              id="discountRate"
              name="discountRate"
              type="number"
              min="5"
              max="90"
              value={formData.discountRate}
              onChange={handleInputChange}
              placeholder="30"
              required
            />
            <p className="text-xs text-muted-foreground">5% ~ 90% 사이의 할인율을 입력하세요</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="startTime">시작 시간 *</Label>
              <Input
                id="startTime"
                name="startTime"
                type="datetime-local"
                value={formData.startTime || getDefaultStartTime()}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endTime">종료 시간 *</Label>
              <Input
                id="endTime"
                name="endTime"
                type="datetime-local"
                value={formData.endTime || getDefaultEndTime()}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>푸시 알림</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="sendPushNotification"
              checked={sendPushNotification}
              onChange={(e) => setSendPushNotification(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
            <Label htmlFor="sendPushNotification" className="cursor-pointer">
              단골 고객에게 푸시 알림 발송
            </Label>
          </div>
          <p className="text-sm text-muted-foreground">
            이 옵션을 선택하면 우리 상점을 &apos;찜&apos;한 고객들에게 타임세일 알림이 즉시
            발송됩니다.
          </p>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          취소
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              생성 중...
            </>
          ) : (
            <>
              <Bell className="mr-2 h-4 w-4" />
              타임세일 시작
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
