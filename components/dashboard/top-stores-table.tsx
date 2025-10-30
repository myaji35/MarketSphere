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

interface TopStore {
  id: string
  name: string
  category: string
  productsCount: number
  timeSalesCount: number
  approvalStatus: string
}

interface TopStoresTableProps {
  stores: TopStore[]
}

export function TopStoresTable({ stores }: TopStoresTableProps) {
  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      APPROVED: 'default',
      PENDING: 'secondary',
      REJECTED: 'destructive',
      SUSPENDED: 'outline',
    }
    const labels: Record<string, string> = {
      APPROVED: '승인',
      PENDING: '대기',
      REJECTED: '거부',
      SUSPENDED: '정지',
    }
    return (
      <Badge variant={variants[status] || 'outline'} className="text-xs">
        {labels[status] || status}
      </Badge>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>인기 상점 순위</CardTitle>
        <CardDescription>상품 수 기준 Top 10</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">순위</TableHead>
              <TableHead>상점명</TableHead>
              <TableHead>업종</TableHead>
              <TableHead className="text-right">상품 수</TableHead>
              <TableHead className="text-right">타임세일</TableHead>
              <TableHead className="text-center">상태</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stores.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  데이터가 없습니다
                </TableCell>
              </TableRow>
            ) : (
              stores.map((store, index) => (
                <TableRow key={store.id}>
                  <TableCell className="font-medium">
                    {index + 1 <= 3 ? (
                      <span className="text-lg">
                        {index + 1 === 1 ? '🥇' : index + 1 === 2 ? '🥈' : '🥉'}
                      </span>
                    ) : (
                      index + 1
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{store.name}</TableCell>
                  <TableCell>{store.category}</TableCell>
                  <TableCell className="text-right">{store.productsCount}개</TableCell>
                  <TableCell className="text-right">{store.timeSalesCount}회</TableCell>
                  <TableCell className="text-center">
                    {getStatusBadge(store.approvalStatus)}
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
