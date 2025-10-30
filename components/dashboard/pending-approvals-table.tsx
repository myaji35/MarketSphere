'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle } from 'lucide-react'
import { ApprovalDialog } from './approval-dialog'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'

interface PendingStore {
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
}

interface PendingApprovalsTableProps {
  stores: PendingStore[]
  onApprove: (storeId: string) => Promise<void>
  onReject: (storeId: string, reason: string) => Promise<void>
}

export function PendingApprovalsTable({ stores, onApprove, onReject }: PendingApprovalsTableProps) {
  const [selectedStore, setSelectedStore] = useState<PendingStore | null>(null)
  const [dialogType, setDialogType] = useState<'approve' | 'reject' | null>(null)

  const handleOpenDialog = (store: PendingStore, type: 'approve' | 'reject') => {
    setSelectedStore(store)
    setDialogType(type)
  }

  const handleCloseDialog = () => {
    setSelectedStore(null)
    setDialogType(null)
  }

  const handleConfirm = async (reason?: string) => {
    if (!selectedStore) return

    try {
      if (dialogType === 'approve') {
        await onApprove(selectedStore.id)
      } else if (dialogType === 'reject' && reason) {
        await onReject(selectedStore.id, reason)
      }
      handleCloseDialog()
    } catch (error) {
      console.error('Approval/Rejection error:', error)
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>승인 대기 상점</CardTitle>
              <CardDescription>가입 신청 대기 중인 상점 목록</CardDescription>
            </div>
            <Badge variant="secondary" className="text-sm">
              {stores.length}건 대기
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>상점명</TableHead>
                <TableHead>업종</TableHead>
                <TableHead>신청자</TableHead>
                <TableHead>전화번호</TableHead>
                <TableHead>위치</TableHead>
                <TableHead>신청일</TableHead>
                <TableHead className="text-right">처리</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stores.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    승인 대기 중인 상점이 없습니다
                  </TableCell>
                </TableRow>
              ) : (
                stores.map((store) => (
                  <TableRow key={store.id}>
                    <TableCell className="font-medium">{store.storeName}</TableCell>
                    <TableCell>{store.category}</TableCell>
                    <TableCell>{store.owner.name || '-'}</TableCell>
                    <TableCell>{store.phone}</TableCell>
                    <TableCell>{store.location || '-'}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(store.createdAt), {
                        addSuffix: true,
                        locale: ko,
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleOpenDialog(store, 'approve')}
                        >
                          <CheckCircle className="mr-1 h-4 w-4" />
                          승인
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleOpenDialog(store, 'reject')}
                        >
                          <XCircle className="mr-1 h-4 w-4" />
                          거부
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {selectedStore && dialogType && (
        <ApprovalDialog
          store={selectedStore}
          type={dialogType}
          open={dialogType !== null}
          onClose={handleCloseDialog}
          onConfirm={handleConfirm}
        />
      )}
    </>
  )
}
