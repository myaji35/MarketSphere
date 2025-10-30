'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Sparkles, Image as ImageIcon } from 'lucide-react'

interface ProductFormProps {
  storeId: string
}

export function ProductForm({ storeId }: ProductFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  const [formData, setFormData] = useState({
    productName: '',
    price: '',
    discountPrice: '',
    imageUrl: '',
    aiGeneratedDescription: '',
    aiGeneratedHashtags: [] as string[],
    stock: '',
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleGenerateContent = async () => {
    if (!formData.imageUrl) {
      toast({
        title: '이미지 URL을 입력해주세요',
        description: '상품 이미지 URL을 먼저 입력해야 합니다.',
        variant: 'destructive',
      })
      return
    }

    setIsGenerating(true)

    try {
      const response = await fetch('/api/ai/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: formData.imageUrl,
          storeId,
        }),
      })

      if (!response.ok) {
        throw new Error('콘텐츠 생성에 실패했습니다')
      }

      const result = await response.json()

      setFormData((prev) => ({
        ...prev,
        aiGeneratedDescription: result.data.description,
        aiGeneratedHashtags: result.data.hashtags,
      }))

      toast({
        title: 'AI 콘텐츠 생성 완료!',
        description: '홍보 문구와 해시태그가 자동으로 생성되었습니다.',
      })
    } catch (error) {
      console.error('Error generating content:', error)
      toast({
        title: '콘텐츠 생성 실패',
        description: '잠시 후 다시 시도해주세요.',
        variant: 'destructive',
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.productName || !formData.price || !formData.imageUrl) {
      toast({
        title: '필수 항목을 입력해주세요',
        description: '상품명, 가격, 이미지는 필수 항목입니다.',
        variant: 'destructive',
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          storeId,
          price: parseInt(formData.price),
          discountPrice: formData.discountPrice ? parseInt(formData.discountPrice) : null,
          stock: parseInt(formData.stock) || 0,
        }),
      })

      if (!response.ok) {
        throw new Error('상품 등록에 실패했습니다')
      }

      toast({
        title: '상품 등록 완료!',
        description: '새로운 상품이 등록되었습니다.',
      })

      router.push('/merchant/products')
      router.refresh()
    } catch (error) {
      console.error('Error creating product:', error)
      toast({
        title: '상품 등록 실패',
        description: '잠시 후 다시 시도해주세요.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>기본 정보</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="productName">상품명 *</Label>
            <Input
              id="productName"
              name="productName"
              value={formData.productName}
              onChange={handleInputChange}
              placeholder="예: 신선한 사과"
              required
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="price">가격 (원) *</Label>
              <Input
                id="price"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="10000"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="discountPrice">할인가 (원)</Label>
              <Input
                id="discountPrice"
                name="discountPrice"
                type="number"
                value={formData.discountPrice}
                onChange={handleInputChange}
                placeholder="8000"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="stock">재고 수량</Label>
            <Input
              id="stock"
              name="stock"
              type="number"
              value={formData.stock}
              onChange={handleInputChange}
              placeholder="100"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>AI 마케팅 콘텐츠</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="imageUrl">상품 이미지 URL *</Label>
            <div className="flex gap-2">
              <Input
                id="imageUrl"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleInputChange}
                placeholder="https://example.com/image.jpg"
                required
              />
              <Button
                type="button"
                onClick={handleGenerateContent}
                disabled={isGenerating || !formData.imageUrl}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    생성 중...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    AI 생성
                  </>
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              상품 사진 URL을 입력한 후 &apos;AI 생성&apos; 버튼을 클릭하면 자동으로 홍보 문구와
              해시태그가 생성됩니다.
            </p>
          </div>

          {formData.imageUrl && (
            <div className="border rounded-lg p-4">
              <img
                src={formData.imageUrl}
                alt="상품 미리보기"
                className="max-h-48 mx-auto object-contain"
                onError={(e) => {
                  ;(e.target as HTMLImageElement).style.display = 'none'
                }}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="aiGeneratedDescription">AI 생성 홍보 문구</Label>
            <Textarea
              id="aiGeneratedDescription"
              name="aiGeneratedDescription"
              value={formData.aiGeneratedDescription}
              onChange={handleInputChange}
              placeholder="AI가 자동으로 생성한 홍보 문구가 여기에 표시됩니다..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="hashtags">해시태그</Label>
            <div className="flex flex-wrap gap-2 p-3 border rounded-md min-h-[60px]">
              {formData.aiGeneratedHashtags.length > 0 ? (
                formData.aiGeneratedHashtags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary/10 text-primary"
                  >
                    #{tag}
                  </span>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  AI가 생성한 해시태그가 여기에 표시됩니다
                </p>
              )}
            </div>
          </div>
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
              등록 중...
            </>
          ) : (
            '상품 등록'
          )}
        </Button>
      </div>
    </form>
  )
}
