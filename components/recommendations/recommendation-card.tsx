'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ShoppingCart, Sparkles } from 'lucide-react'

interface Product {
  id: string
  productName: string
  price: number
  storeName: string
  storeCategory: string
}

interface RecommendationCardProps {
  menuName: string
  ingredients: string[]
  reason: string
  category: string
  matchedProducts: Product[]
}

export function RecommendationCard({
  menuName,
  ingredients,
  reason,
  category,
  matchedProducts,
}: RecommendationCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-yellow-500" />
              {menuName}
            </CardTitle>
            <CardDescription className="mt-2">{reason}</CardDescription>
          </div>
          <Badge variant="secondary" className="ml-2">
            {category}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 필요한 재료 */}
        <div>
          <h4 className="text-sm font-medium mb-2">필요한 재료</h4>
          <div className="flex flex-wrap gap-2">
            {ingredients.map((ingredient, idx) => (
              <Badge key={idx} variant="outline" className="text-xs">
                {ingredient}
              </Badge>
            ))}
          </div>
        </div>

        {/* 매칭된 상품 */}
        {matchedProducts.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">시장에서 구매 가능</h4>
            <div className="space-y-2">
              {matchedProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-2 bg-muted/50 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium">{product.productName}</p>
                    <p className="text-xs text-muted-foreground">
                      {product.storeName} • {product.storeCategory}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold">{product.price.toLocaleString()}원</span>
                    <Button size="sm" variant="outline">
                      <ShoppingCart className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 상품이 없는 경우 */}
        {matchedProducts.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-2">
            현재 시장에 등록된 상품이 없습니다
          </p>
        )}
      </CardContent>
    </Card>
  )
}
