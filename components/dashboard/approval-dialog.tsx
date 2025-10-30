'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Loader2 } from 'lucide-react'

interface ApprovalDialogProps {
  store: {
    id: string
    storeName: string
    category: string
    phone: string
    owner: {
      name: string | null
      email: string | null
    }
  }
  type: 'approve' | 'reject'
  open: boolean
  onClose: () => void
  onConfirm: (reason?: string) => Promise<void>
}

export function ApprovalDialog({ store, type, open, onClose, onConfirm }: ApprovalDialogProps) {
  const [reason, setReason] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleConfirm = async () => {
    if (type === 'reject' && !reason.trim()) {
      alert('거부 사유를 입력해주세요')
      return
    }

    setIsLoading(true)
    try {
      await onConfirm(type === 'reject' ? reason : undefined)
      setReason('')
    } catch (error) {
      console.error('Confirmation error:', error)
      alert('처리 중 오류가 발생했습니다')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{type === 'approve' ? '상점 승인' : '상점 가입 거부'}</DialogTitle>
          <DialogDescription>
            {type === 'approve'
              ? '이 상점의 가입을 승인하시겠습니까?'
              : '이 상점의 가입을 거부하시겠습니까? 거부 사유는 신청자에게 전달됩니다.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <div className="grid grid-cols-3 gap-2 text-sm">
              <span className="font-medium text-muted-foreground">상점명:</span>
              <span className="col-span-2">{store.storeName}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <span className="font-medium text-muted-foreground">업종:</span>
              <span className="col-span-2">{store.category}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <span className="font-medium text-muted-foreground">신청자:</span>
              <span className="col-span-2">{store.owner.name || '-'}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <span className="font-medium text-muted-foreground">연락처:</span>
              <span className="col-span-2">{store.phone}</span>
            </div>
          </div>

          {type === 'reject' && (
            <div className="space-y-2">
              <Label htmlFor="reason">거부 사유 *</Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="거부 사유를 상세히 입력해주세요&#13;&#10;예: 서류 미비, 시장 내 동일 업종 포화 등"
                rows={4}
                required
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            취소
          </Button>
          <Button
            variant={type === 'approve' ? 'default' : 'destructive'}
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                처리 중...
              </>
            ) : type === 'approve' ? (
              '승인'
            ) : (
              '거부'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
