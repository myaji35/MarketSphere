'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Heart, Store, Package, Percent, Phone, MapPin, Loader2, Trash2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'

interface FavoriteStore {
  id: string
  storeId: string
  storeName: string
  category: string
  location: string | null
  phone: string
  photoUrl: string | null
  marketName: string
  productsCount: number
  timeSalesCount: number
  createdAt: string
}

export default function FavoritesPage() {
  const { toast } = useToast()
  const [favorites, setFavorites] = useState<FavoriteStore[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [userId] = useState('guest') // TODO: 실제로는 사용자 세션에서 가져와야 함

  const fetchFavorites = async () => {
    if (userId === 'guest') {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/favorites?userId=${userId}`)

      if (!response.ok) {
        throw new Error('Failed to fetch favorites')
      }

      const result = await response.json()
      setFavorites(result.data)
    } catch (error) {
      console.error('Favorites fetch error:', error)
      toast({
        title: '데이터 로드 실패',
        description: '단골 상점 목록을 불러오는데 실패했습니다.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchFavorites()
  }, [userId])

  const handleRemoveFavorite = async (favoriteId: string, storeName: string) => {
    try {
      const response = await fetch(`/api/favorites?id=${favoriteId}&userId=${userId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to remove favorite')
      }

      toast({
        title: '단골 해제 완료',
        description: `${storeName}을(를) 단골 상점에서 제거했습니다.`,
      })

      // 목록 새로고침
      fetchFavorites()
    } catch (error) {
      console.error('Remove favorite error:', error)
      toast({
        title: '단골 해제 실패',
        description: '단골 해제 중 오류가 발생했습니다.',
        variant: 'destructive',
      })
    }
  }

  if (userId === 'guest') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>로그인 필요</CardTitle>
            <CardDescription>단골 상점 기능을 사용하려면 로그인이 필요합니다.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">로그인하기</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">단골 상점을 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* 헤더 */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Heart className="h-8 w-8 text-red-500 fill-red-500" />
            <h1 className="text-4xl font-bold">나의 단골 상점</h1>
          </div>
          <p className="text-muted-foreground">{favorites.length}개의 상점을 단골로 등록했습니다</p>
        </div>

        {/* 단골 상점 목록 */}
        {favorites.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">단골 상점이 없습니다</h3>
              <p className="text-muted-foreground mb-4">
                마음에 드는 상점을 단골로 등록하고 소식을 받아보세요
              </p>
              <Button>상품 검색하러 가기</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {favorites.map((favorite) => (
              <Card key={favorite.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Store className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <CardTitle className="text-lg">{favorite.storeName}</CardTitle>
                        <CardDescription className="mt-1">
                          {favorite.category} • {favorite.marketName}
                        </CardDescription>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveFavorite(favorite.id, favorite.storeName)}
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* 통계 */}
                  <div className="flex gap-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <span>상품 {favorite.productsCount}개</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Percent className="h-4 w-4 text-muted-foreground" />
                      <span>타임세일 {favorite.timeSalesCount}회</span>
                    </div>
                  </div>

                  {/* 연락처 */}
                  {favorite.location && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{favorite.location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span>{favorite.phone}</span>
                  </div>

                  {/* 등록 시간 */}
                  <div className="pt-2 border-t">
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(favorite.createdAt), {
                        addSuffix: true,
                        locale: ko,
                      })}{' '}
                      등록
                    </p>
                  </div>

                  {/* 액션 버튼 */}
                  <Button className="w-full">상점 방문하기</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
