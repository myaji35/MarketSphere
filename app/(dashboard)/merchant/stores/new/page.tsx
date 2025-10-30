'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
import { useToast } from '@/hooks/use-toast'

const CATEGORIES = [
  '청과',
  '정육',
  '수산',
  '반찬',
  '분식',
  '한식',
  '중식',
  '일식',
  '양식',
  '카페/디저트',
  '의류',
  '잡화',
  '기타',
]

export default function NewStorePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    storeName: '',
    category: '',
    marketId: '',
    location: '',
    phone: '',
    hoursOpen: '09:00',
    hoursClose: '20:00',
    closedDays: [] as string[],
    photoUrl: '',
    description: '',
  })
  const [generatedSubdomain, setGeneratedSubdomain] = useState('')

  const totalSteps = 5

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    // 상점명 변경 시 서브도메인 미리보기 생성
    if (field === 'storeName' && typeof value === 'string') {
      const subdomain = generateSubdomain(value)
      setGeneratedSubdomain(subdomain)
    }
  }

  const generateSubdomain = (storeName: string): string => {
    // 한글 → 영문 변환 (간단한 로직)
    const korToEng: { [key: string]: string } = {
      김밥: 'kimbap',
      천국: 'chunguk',
      떡볶이: 'tteokbokki',
      순대: 'sundae',
      국밥: 'gukbap',
      // 실제로는 더 많은 매핑 필요
    }

    let result = storeName
    Object.keys(korToEng).forEach((kor) => {
      result = result.replace(kor, korToEng[kor])
    })

    // 영문 소문자로 변환, 공백 제거
    result = result.toLowerCase().replace(/\s+/g, '')

    // 특수문자 제거
    result = result.replace(/[^a-z0-9]/g, '')

    return result || 'store'
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/stores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          hours: {
            open: formData.hoursOpen,
            close: formData.hoursClose,
            closedDays: formData.closedDays,
          },
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '상점 등록에 실패했습니다')
      }

      toast({
        title: '가입 신청 완료!',
        description: '상인회 승인을 기다려주세요 (1~2영업일)',
      })

      router.push('/merchant')
    } catch (error) {
      toast({
        title: '오류',
        description: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const nextStep = () => {
    if (step < totalSteps) setStep(step + 1)
  }

  const prevStep = () => {
    if (step > 1) setStep(step - 1)
  }

  return (
    <div className="container max-w-2xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">상점 가입 신청</h1>
        <p className="text-muted-foreground mt-2">
          5분 안에 간단하게 상점을 등록하고 온라인 영업을 시작하세요
        </p>
      </div>

      {/* 진행률 표시 */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">
            {step}/{totalSteps} 단계
          </span>
          <span className="text-sm text-muted-foreground">
            {Math.round((step / totalSteps) * 100)}%
          </span>
        </div>
        <div className="w-full bg-secondary rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>
              {step === 1 && '기본 정보'}
              {step === 2 && '시장 선택'}
              {step === 3 && '연락처 정보'}
              {step === 4 && '영업시간 설정'}
              {step === 5 && '추가 정보'}
            </CardTitle>
            <CardDescription>
              {step === 1 && '상점명과 업종을 입력해주세요'}
              {step === 2 && '상점이 위치한 시장을 선택해주세요'}
              {step === 3 && '연락처와 위치를 입력해주세요'}
              {step === 4 && '영업시간과 휴무일을 설정해주세요'}
              {step === 5 && '상점 사진과 설명을 추가해주세요 (선택)'}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Step 1: 기본 정보 */}
            {step === 1 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="storeName">상점명 *</Label>
                  <Input
                    id="storeName"
                    value={formData.storeName}
                    onChange={(e) => handleInputChange('storeName', e.target.value)}
                    placeholder="예: 김밥천국"
                    required
                    minLength={2}
                    maxLength={30}
                  />
                  {generatedSubdomain && (
                    <p className="text-xs text-muted-foreground">
                      서브도메인 미리보기: {generatedSubdomain}.망원시장.marketsphere.com
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">업종 *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => handleInputChange('category', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="업종 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {/* Step 2: 시장 선택 */}
            {step === 2 && (
              <div className="space-y-2">
                <Label htmlFor="marketId">시장 선택 *</Label>
                <Select
                  value={formData.marketId}
                  onValueChange={(value) => handleInputChange('marketId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="시장 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mangwon-market">망원시장</SelectItem>
                    <SelectItem value="gwangjang-market">광장시장</SelectItem>
                    <SelectItem value="namdaemun-market">남대문시장</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  상점이 위치한 전통시장을 선택해주세요
                </p>
              </div>
            )}

            {/* Step 3: 연락처 정보 */}
            {step === 3 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="phone">전화번호 *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="010-1234-5678"
                    required
                    pattern="[0-9]{2,3}-[0-9]{3,4}-[0-9]{4}"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">상점 위치</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="예: 3번 게이트 근처"
                  />
                </div>
              </>
            )}

            {/* Step 4: 영업시간 */}
            {step === 4 && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="hoursOpen">오픈 시간</Label>
                    <Input
                      id="hoursOpen"
                      type="time"
                      value={formData.hoursOpen}
                      onChange={(e) => handleInputChange('hoursOpen', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hoursClose">마감 시간</Label>
                    <Input
                      id="hoursClose"
                      type="time"
                      value={formData.hoursClose}
                      onChange={(e) => handleInputChange('hoursClose', e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>휴무일 (선택)</Label>
                  <div className="flex flex-wrap gap-2">
                    {['월요일', '화요일', '수요일', '목요일', '금요일', '토요일', '일요일'].map(
                      (day) => (
                        <Button
                          key={day}
                          type="button"
                          variant={formData.closedDays.includes(day) ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => {
                            const newDays = formData.closedDays.includes(day)
                              ? formData.closedDays.filter((d) => d !== day)
                              : [...formData.closedDays, day]
                            handleInputChange('closedDays', newDays)
                          }}
                        >
                          {day}
                        </Button>
                      )
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Step 5: 추가 정보 */}
            {step === 5 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="photoUrl">상점 대표 사진 URL (선택)</Label>
                  <Input
                    id="photoUrl"
                    type="url"
                    value={formData.photoUrl}
                    onChange={(e) => handleInputChange('photoUrl', e.target.value)}
                    placeholder="https://..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">상점 소개 (선택)</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="상점을 간단히 소개해주세요"
                    rows={4}
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* 네비게이션 버튼 */}
        <div className="flex justify-between mt-6">
          <Button type="button" variant="outline" onClick={prevStep} disabled={step === 1}>
            이전
          </Button>
          {step < totalSteps ? (
            <Button
              type="button"
              onClick={nextStep}
              disabled={
                (step === 1 && (!formData.storeName || !formData.category)) ||
                (step === 2 && !formData.marketId) ||
                (step === 3 && !formData.phone)
              }
            >
              다음
            </Button>
          ) : (
            <Button type="submit" disabled={isLoading}>
              {isLoading ? '등록 중...' : '가입 신청'}
            </Button>
          )}
        </div>
      </form>
    </div>
  )
}
