import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  ArrowRight,
  Sparkles,
  Store,
  Users,
  TrendingUp,
  Brain,
  Clock,
  Heart,
  Search,
  ShoppingBag,
  BarChart3,
  Zap,
  CheckCircle2,
} from 'lucide-react'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32 lg:py-40">
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-blue-50 via-purple-50/50 to-background" />

        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="secondary" className="mb-4 px-3 py-1">
              <Sparkles className="mr-1 h-3 w-3" />
              AI 기반 마케팅 자동화
            </Badge>
            <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              전통시장의{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                디지털 혁신
              </span>
            </h1>
            <p className="mb-8 text-lg text-muted-foreground sm:text-xl">
              AI가 자동으로 마케팅을 관리하는 동안, 소상공인은 본업에만 집중하세요.
              <br />
              고객에게는 똑똑한 장보기 경험을 제공합니다.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                asChild
              >
                <Link href="/sign-up">
                  무료로 시작하기 <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/search">상품 검색하기</Link>
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-16 grid gap-8 sm:grid-cols-3">
            <div className="text-center">
              <div className="mb-2 text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                100+
              </div>
              <div className="text-sm text-muted-foreground">등록된 상점</div>
            </div>
            <div className="text-center">
              <div className="mb-2 text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                50K+
              </div>
              <div className="text-sm text-muted-foreground">월간 방문자</div>
            </div>
            <div className="text-center">
              <div className="mb-2 text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                98%
              </div>
              <div className="text-sm text-muted-foreground">고객 만족도</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center mb-12">
            <Badge variant="secondary" className="mb-4">
              핵심 기능
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
              세 가지 주체, 하나의 플랫폼
            </h2>
            <p className="text-muted-foreground">소상공인, 상인회, 고객 모두를 위한 통합 솔루션</p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {/* 소상공인 */}
            <Card className="border-2 hover:border-blue-500 transition-all hover:shadow-lg">
              <CardContent className="pt-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600">
                  <Store className="h-6 w-6 text-white" />
                </div>
                <h3 className="mb-2 text-xl font-bold">소상공인</h3>
                <p className="mb-4 text-sm text-muted-foreground">
                  AI 자동화로 마케팅 걱정 없이 본업에만 집중
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>AI 자동 컨텐츠 생성</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>타임세일 알림 자동 발송</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>실시간 재고 관리</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>날씨 기반 마케팅</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* 상인회 */}
            <Card className="border-2 hover:border-purple-500 transition-all hover:shadow-lg">
              <CardContent className="pt-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-purple-600">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <h3 className="mb-2 text-xl font-bold">상인회</h3>
                <p className="mb-4 text-sm text-muted-foreground">
                  시장 전체 데이터 분석 및 공동 마케팅
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>시장 전체 대시보드</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>공동 마케팅 캠페인</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>상점 승인 관리</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>매출 통계 분석</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* 고객 */}
            <Card className="border-2 hover:border-green-500 transition-all hover:shadow-lg">
              <CardContent className="pt-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-green-600">
                  <ShoppingBag className="h-6 w-6 text-white" />
                </div>
                <h3 className="mb-2 text-xl font-bold">고객</h3>
                <p className="mb-4 text-sm text-muted-foreground">AI 추천으로 편리한 장보기 경험</p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>AI 맞춤 상품 추천</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>통합 상품 검색</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>단골 상점 관리</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>실시간 타임세일 알림</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center mb-12">
            <Badge variant="secondary" className="mb-4">
              작동 원리
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
              간단한 3단계로 시작하세요
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="relative">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white text-2xl font-bold">
                1
              </div>
              <h3 className="mb-2 text-xl font-bold">가입 및 등록</h3>
              <p className="text-muted-foreground">
                간단한 정보 입력만으로 상점을 등록하고 즉시 시작할 수 있습니다.
              </p>
            </div>

            <div className="relative">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 text-white text-2xl font-bold">
                2
              </div>
              <h3 className="mb-2 text-xl font-bold">AI 자동화 설정</h3>
              <p className="text-muted-foreground">
                AI가 자동으로 컨텐츠를 생성하고 고객에게 마케팅 메시지를 전송합니다.
              </p>
            </div>

            <div className="relative">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-green-600 text-white text-2xl font-bold">
                3
              </div>
              <h3 className="mb-2 text-xl font-bold">성과 확인</h3>
              <p className="text-muted-foreground">
                실시간 대시보드에서 매출, 방문자, 고객 반응 등을 확인하세요.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* AI Features */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center mb-12">
            <Badge variant="secondary" className="mb-4">
              <Sparkles className="mr-1 h-3 w-3" />
              AI 기능
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
              강력한 AI가 모든 것을 자동화합니다
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <Brain className="h-10 w-10 mb-4 text-blue-600" />
                <h3 className="font-bold mb-2">AI 컨텐츠 생성</h3>
                <p className="text-sm text-muted-foreground">
                  상품 이미지만 올리면 AI가 자동으로 매력적인 설명을 생성합니다.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <Clock className="h-10 w-10 mb-4 text-purple-600" />
                <h3 className="font-bold mb-2">스마트 타이밍</h3>
                <p className="text-sm text-muted-foreground">
                  날씨, 시간대를 분석해 최적의 타이밍에 프로모션을 자동 진행합니다.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <TrendingUp className="h-10 w-10 mb-4 text-green-600" />
                <h3 className="font-bold mb-2">개인화 추천</h3>
                <p className="text-sm text-muted-foreground">
                  고객별 선호도를 학습해 맞춤형 상품을 추천합니다.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <BarChart3 className="h-10 w-10 mb-4 text-orange-600" />
                <h3 className="font-bold mb-2">데이터 분석</h3>
                <p className="text-sm text-muted-foreground">
                  판매 패턴을 분석해 인사이트를 제공하고 전략을 제안합니다.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container">
          <Card className="border-2 bg-gradient-to-r from-blue-50 to-purple-50">
            <CardContent className="p-12 text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
                지금 바로 시작하세요
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                무료로 시작하고, 전통시장의 디지털 혁신에 동참하세요.
                <br />첫 달은 모든 기능을 무료로 사용할 수 있습니다.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  asChild
                >
                  <Link href="/sign-up">
                    무료로 시작하기 <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/contact">문의하기</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  )
}
