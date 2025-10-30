'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, TrendingUp, TrendingDown, Heart, Loader2, Store } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface Product {
  id: string
  productName: string
  price: number
  discountPrice: number | null
  imageUrl: string
  stock: number
  aiGeneratedDescription: string | null
}

interface StoreResult {
  store: {
    id: string
    storeName: string
    category: string
    location: string | null
    phone: string
    marketName: string
  }
  products: Product[]
  minPrice: number
  maxPrice: number
}

interface SearchStats {
  totalProducts: number
  totalStores: number
  minPrice: number
  maxPrice: number
  avgPrice: number
}

export default function SearchPage() {
  const { toast } = useToast()
  const [query, setQuery] = useState('')
  const [sortBy, setSortBy] = useState('relevance')
  const [results, setResults] = useState<StoreResult[]>([])
  const [stats, setStats] = useState<SearchStats | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  const handleSearch = async () => {
    if (!query.trim()) {
      toast({
        title: '검색어 입력',
        description: '검색하실 상품명을 입력해주세요.',
        variant: 'destructive',
      })
      return
    }

    setIsLoading(true)
    setHasSearched(true)

    try {
      const response = await fetch(
        `/api/products/search?q=${encodeURIComponent(query)}&sortBy=${sortBy}`
      )

      if (!response.ok) {
        throw new Error('Search failed')
      }

      const data = await response.json()
      setResults(data.data.results)
      setStats(data.data.stats)
    } catch (error) {
      console.error('Search error:', error)
      toast({
        title: '검색 실패',
        description: '상품 검색 중 오류가 발생했습니다.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const handleAddToFavorite = async (storeId: string, storeName: string) => {
    // TODO: 실제로는 사용자 세션에서 userId 가져와야 함
    const userId = 'guest'

    if (userId === 'guest') {
      toast({
        title: '로그인 필요',
        description: '단골 등록을 하려면 로그인이 필요합니다.',
        variant: 'destructive',
      })
      return
    }

    try {
      const response = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, storeId }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error)
      }

      toast({
        title: '단골 등록 완료',
        description: `${storeName}을(를) 단골 상점으로 등록했습니다!`,
      })
    } catch (error: any) {
      toast({
        title: '단골 등록 실패',
        description: error.message || '단골 등록 중 오류가 발생했습니다.',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-6xl mx-auto px-4 py-8 space-y-6">
        {/* 검색 헤더 */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">상품 통합 검색</h1>
          <p className="text-muted-foreground">
            시장 전체 상점의 상품을 검색하고 가격을 비교하세요
          </p>

          {/* 검색 바 */}
          <div className="flex gap-2 max-w-2xl mx-auto">
            <Input
              placeholder="상품명을 입력하세요 (예: 사과, 배추, 고추)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
            />
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">관련순</SelectItem>
                <SelectItem value="price_asc">낮은 가격순</SelectItem>
                <SelectItem value="price_desc">높은 가격순</SelectItem>
                <SelectItem value="newest">최신순</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleSearch} disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  검색
                </>
              )}
            </Button>
          </div>
        </div>

        {/* 검색 통계 */}
        {stats && hasSearched && (
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                <div>
                  <p className="text-sm text-muted-foreground">총 상품</p>
                  <p className="text-2xl font-bold">{stats.totalProducts}개</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">판매 상점</p>
                  <p className="text-2xl font-bold">{stats.totalStores}곳</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">최저가</p>
                  <p className="text-2xl font-bold text-green-600">
                    {stats.minPrice.toLocaleString()}원
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">최고가</p>
                  <p className="text-2xl font-bold text-red-600">
                    {stats.maxPrice.toLocaleString()}원
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">평균가</p>
                  <p className="text-2xl font-bold">{stats.avgPrice.toLocaleString()}원</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 검색 결과 */}
        {hasSearched && !isLoading && (
          <div className="space-y-4">
            {results.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <p className="text-muted-foreground">
                    &apos;{query}&apos; 검색 결과가 없습니다.
                    <br />
                    다른 검색어를 시도해보세요.
                  </p>
                </CardContent>
              </Card>
            ) : (
              results.map((result) => (
                <Card key={result.store.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Store className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <CardTitle>{result.store.storeName}</CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">
                            {result.store.category} • {result.store.marketName}
                            {result.store.location && ` • ${result.store.location}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">가격대</p>
                          <p className="text-sm font-medium">
                            {result.minPrice.toLocaleString()}원
                            {result.minPrice !== result.maxPrice &&
                              ` ~ ${result.maxPrice.toLocaleString()}원`}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() =>
                            handleAddToFavorite(result.store.id, result.store.storeName)
                          }
                        >
                          <Heart className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {result.products.map((product) => (
                        <div
                          key={product.id}
                          className="border rounded-lg p-3 hover:shadow-md transition-shadow"
                        >
                          <div className="aspect-square bg-muted rounded-md mb-2 overflow-hidden">
                            {product.imageUrl ? (
                              <img
                                src={product.imageUrl}
                                alt={product.productName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                No Image
                              </div>
                            )}
                          </div>
                          <h4 className="font-medium line-clamp-1">{product.productName}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-lg font-bold">
                              {product.price.toLocaleString()}원
                            </span>
                            {product.discountPrice && (
                              <Badge variant="destructive" className="text-xs">
                                할인
                              </Badge>
                            )}
                          </div>
                          {product.stock > 0 ? (
                            <p className="text-xs text-green-600 mt-1">재고: {product.stock}개</p>
                          ) : (
                            <p className="text-xs text-red-500 mt-1">품절</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}

        {/* 로딩 상태 */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">상품을 검색하는 중...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
