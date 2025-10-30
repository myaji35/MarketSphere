import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Phone, MapPin, Clock, Timer, Heart } from 'lucide-react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'

interface StorePageProps {
  params: {
    subdomain: string
  }
}

export default async function StorePage({ params }: StorePageProps) {
  const { subdomain } = params

  // subdomain을 파싱 (예: "kimbapchunguk.mangwon" → marketId 조회 필요)
  // 간단한 구현을 위해 subdomain만으로 조회
  const store = await prisma.store.findFirst({
    where: {
      subdomain: subdomain.split('.')[0], // 첫 번째 부분만 사용
      approvalStatus: 'APPROVED',
    },
    include: {
      market: true,
      products: {
        where: {
          isAvailable: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
      timeSales: {
        where: {
          isActive: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  })

  if (!store) {
    notFound()
  }

  // 현재 진행 중인 타임세일
  const now = new Date()
  const activeTimeSales = store.timeSales.filter((ts) => ts.startTime <= now && ts.endTime >= now)

  // 영업시간 파싱
  const hours = store.hours as { open?: string; close?: string; closedDays?: string[] } | null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">{store.storeName}</h1>
              <p className="text-sm text-muted-foreground">{store.market.marketName}</p>
            </div>
            <Button variant="outline" size="sm">
              <Heart className="h-4 w-4 mr-2" />
              찜하기
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* 상점 정보 */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-3">
              {store.photoUrl && (
                <div className="aspect-video relative overflow-hidden rounded-lg">
                  <img
                    src={store.photoUrl}
                    alt={store.storeName}
                    className="object-cover w-full h-full"
                  />
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <MapPin className="h-5 w-5 mt-0.5 text-muted-foreground flex-shrink-0" />
                  <span>{store.location || store.market.address}</span>
                </div>

                <div className="flex items-start gap-2">
                  <Phone className="h-5 w-5 mt-0.5 text-muted-foreground flex-shrink-0" />
                  <span>{store.phone}</span>
                </div>

                {hours && (
                  <div className="flex items-start gap-2">
                    <Clock className="h-5 w-5 mt-0.5 text-muted-foreground flex-shrink-0" />
                    <div>
                      <div>
                        {hours.open && hours.close
                          ? `${hours.open} - ${hours.close}`
                          : '영업시간 문의'}
                      </div>
                      {hours.closedDays && hours.closedDays.length > 0 && (
                        <div className="text-sm text-muted-foreground">
                          휴무: {hours.closedDays.join(', ')}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {store.description && (
                  <p className="text-muted-foreground pt-2">{store.description}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 진행 중인 타임세일 */}
        {activeTimeSales.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Timer className="h-5 w-5 text-red-500" />
              진행 중인 타임세일
            </h2>
            <div className="space-y-3">
              {activeTimeSales.map((timeSale) => (
                <Card key={timeSale.id} className="border-red-200 bg-red-50">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-lg">{timeSale.title}</h3>
                        {timeSale.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {timeSale.description}
                          </p>
                        )}
                        <p className="text-sm text-muted-foreground mt-2">
                          {format(timeSale.endTime, 'M월 d일 HH:mm', { locale: ko })}까지
                        </p>
                      </div>
                      <div className="text-3xl font-bold text-red-600">
                        -{timeSale.discountRate}%
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* 상품 목록 */}
        <div className="space-y-3">
          <h2 className="text-xl font-bold">판매 상품</h2>
          {store.products.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                등록된 상품이 없습니다
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {store.products.map((product) => (
                <Card key={product.id}>
                  <CardHeader className="p-0">
                    <div className="aspect-square relative overflow-hidden rounded-t-lg">
                      <img
                        src={product.imageUrl}
                        alt={product.productName}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <CardTitle className="text-lg mb-2">{product.productName}</CardTitle>

                    <div className="flex items-center gap-2 mb-2">
                      {product.discountPrice ? (
                        <>
                          <span className="text-xl font-bold text-primary">
                            {product.discountPrice.toLocaleString()}원
                          </span>
                          <span className="text-sm line-through text-muted-foreground">
                            {product.price.toLocaleString()}원
                          </span>
                        </>
                      ) : (
                        <span className="text-xl font-bold">
                          {product.price.toLocaleString()}원
                        </span>
                      )}
                    </div>

                    {product.aiGeneratedDescription && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                        {product.aiGeneratedDescription}
                      </p>
                    )}

                    {product.aiGeneratedHashtags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {product.aiGeneratedHashtags.slice(0, 3).map((tag, idx) => (
                          <span
                            key={idx}
                            className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
