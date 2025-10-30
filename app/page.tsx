import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
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
  CreditCard,
  MessageSquare,
  Package,
  Calendar,
  Star,
  Quote,
} from 'lucide-react'
import { BorderBeam } from '@/components/magicui/border-beam'
import { AnimatedGridPattern } from '@/components/magicui/animated-grid-pattern'
import { DotPattern } from '@/components/magicui/dot-pattern'

export default function Home() {
  const testimonials = [
    {
      name: '김영희',
      role: '망원시장 청과물 가게 운영',
      content:
        'AI가 자동으로 마케팅을 해주니 정말 편해요. 특히 날씨에 맞춰서 자동으로 프로모션을 돌려주는 게 신기해요. 매출이 30% 올랐어요!',
      rating: 5,
    },
    {
      name: '박민수',
      role: '광장시장 상인회장',
      content:
        '시장 전체 상점들을 한 눈에 관리할 수 있어서 너무 좋습니다. 통계 데이터로 시장 활성화 전략도 세울 수 있게 되었어요.',
      rating: 5,
    },
    {
      name: '이수진',
      role: '직장인, 단골 고객',
      content:
        'AI 추천으로 제 취향에 맞는 상품을 찾기 쉬워졌어요. 타임세일 알림도 실시간으로 와서 좋은 가격에 장보기 좋아요.',
      rating: 5,
    },
  ]

  return (
    <main className="flex min-h-screen flex-col">
      {/* Hero Section - Enhanced */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-20 md:py-32">
        <AnimatedGridPattern
          numSquares={30}
          maxOpacity={0.3}
          duration={3}
          repeatDelay={1}
          className="absolute inset-0 -z-10 text-blue-500/20"
        />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_30%_50%,rgba(59,130,246,0.1),transparent_50%),radial-gradient(circle_at_70%_50%,rgba(168,85,247,0.1),transparent_50%)]"></div>

        <div className="container">
          <div className="mx-auto max-w-4xl text-center">
            <Badge variant="secondary" className="mb-6 border-blue-200 bg-blue-50 px-4 py-1.5">
              <Sparkles className="mr-1.5 h-3.5 w-3.5 text-blue-600" />
              <span className="text-blue-700">2500+ 소상공인이 선택한 No.1 플랫폼</span>
            </Badge>

            <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              AI가 마케팅을 대신하는
              <br />
              <span className="animate-gradient bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent bg-[length:200%_auto]">
                스마트한 전통시장
              </span>
            </h1>

            <p className="mb-10 text-lg text-muted-foreground sm:text-xl md:text-2xl">
              번거로운 마케팅은 AI에게 맡기고, 본업에만 집중하세요.
              <br />
              <span className="text-base">첫 달 무료로 모든 기능을 사용해보실 수 있습니다.</span>
            </p>

            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button
                size="lg"
                className="group relative h-14 overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 px-8 text-base transition-all hover:from-blue-700 hover:to-purple-700 hover:shadow-lg hover:shadow-blue-500/50"
                asChild
              >
                <Link href="/sign-up">
                  <span className="relative z-10">무료로 시작하기</span>
                  <ArrowRight className="relative z-10 ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  <div className="absolute inset-0 -z-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 opacity-0 group-hover:animate-shimmer group-hover:opacity-100"></div>
                  <BorderBeam
                    size={250}
                    duration={12}
                    delay={9}
                    colorFrom="#60a5fa"
                    colorTo="#a78bfa"
                  />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-14 px-8 text-base hover:bg-muted/50"
                asChild
              >
                <Link href="/search">상품 둘러보기</Link>
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="mt-16 grid gap-6 sm:grid-cols-3">
              <div className="group rounded-2xl bg-white/60 p-6 backdrop-blur-sm transition-all hover:bg-white/80 hover:shadow-lg hover:shadow-blue-500/20">
                <div className="mb-2 text-3xl font-bold text-blue-600 transition-transform group-hover:scale-110">
                  2,500+
                </div>
                <div className="text-sm text-muted-foreground">등록된 상점</div>
              </div>
              <div className="group rounded-2xl bg-white/60 p-6 backdrop-blur-sm transition-all hover:bg-white/80 hover:shadow-lg hover:shadow-purple-500/20 sm:animate-float">
                <div className="mb-2 text-3xl font-bold text-purple-600 transition-transform group-hover:scale-110">
                  150만+
                </div>
                <div className="text-sm text-muted-foreground">월간 방문자</div>
              </div>
              <div className="group rounded-2xl bg-white/60 p-6 backdrop-blur-sm transition-all hover:bg-white/80 hover:shadow-lg hover:shadow-pink-500/20">
                <div className="mb-2 text-3xl font-bold text-pink-600 transition-transform group-hover:scale-110">
                  4.9★
                </div>
                <div className="text-sm text-muted-foreground">고객 만족도</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Solutions by Category - Tabs */}
      <section className="relative py-20 bg-white overflow-hidden">
        <DotPattern
          width={20}
          height={20}
          cx={1}
          cy={1}
          cr={1}
          className="absolute inset-0 text-neutral-300/40"
        />
        <div className="container relative z-10">
          <div className="mx-auto max-w-2xl text-center mb-12">
            <Badge variant="outline" className="mb-4 border-purple-200 text-purple-700">
              맞춤 솔루션
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
              누구를 위한 서비스인가요?
            </h2>
            <p className="text-muted-foreground">
              소상공인, 상인회, 고객 모두를 위한 통합 플랫폼입니다
            </p>
          </div>

          <Tabs defaultValue="merchant" className="w-full">
            <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-3 h-auto p-1">
              <TabsTrigger value="merchant" className="py-3">
                <Store className="mr-2 h-4 w-4" />
                소상공인
              </TabsTrigger>
              <TabsTrigger value="association" className="py-3">
                <Users className="mr-2 h-4 w-4" />
                상인회
              </TabsTrigger>
              <TabsTrigger value="customer" className="py-3">
                <ShoppingBag className="mr-2 h-4 w-4" />
                고객
              </TabsTrigger>
            </TabsList>

            <TabsContent value="merchant" className="mt-10">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="group border-2 border-blue-100 bg-gradient-to-br from-blue-50 to-white transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-500/30">
                  <CardContent className="pt-6">
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg transition-transform group-hover:scale-110 group-hover:shadow-blue-500/50">
                      <Brain className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="mb-2 text-lg font-bold">AI 컨텐츠 생성</h3>
                    <p className="text-sm text-muted-foreground">
                      상품 사진만 올리면 AI가 자동으로 매력적인 설명을 작성해드려요
                    </p>
                  </CardContent>
                </Card>

                <Card className="group border-2 border-blue-100 bg-gradient-to-br from-blue-50 to-white transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-purple-500/30">
                  <CardContent className="pt-6">
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg transition-transform group-hover:scale-110 group-hover:shadow-purple-500/50">
                      <Zap className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="mb-2 text-lg font-bold">타임세일 자동화</h3>
                    <p className="text-sm text-muted-foreground">
                      재고 상황에 맞춰 AI가 자동으로 타임세일을 진행하고 알림을 발송해요
                    </p>
                  </CardContent>
                </Card>

                <Card className="group border-2 border-blue-100 bg-gradient-to-br from-blue-50 to-white transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-green-500/30">
                  <CardContent className="pt-6">
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-green-600 shadow-lg transition-transform group-hover:scale-110 group-hover:shadow-green-500/50">
                      <Package className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="mb-2 text-lg font-bold">재고 관리</h3>
                    <p className="text-sm text-muted-foreground">
                      실시간 재고 추적과 자동 알림으로 효율적인 재고 관리가 가능해요
                    </p>
                  </CardContent>
                </Card>

                <Card className="group border-2 border-blue-100 bg-gradient-to-br from-blue-50 to-white transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-orange-500/30">
                  <CardContent className="pt-6">
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg transition-transform group-hover:scale-110 group-hover:shadow-orange-500/50">
                      <Clock className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="mb-2 text-lg font-bold">날씨 기반 마케팅</h3>
                    <p className="text-sm text-muted-foreground">
                      날씨와 계절에 맞춰 AI가 최적의 상품을 자동으로 추천해드려요
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="association" className="mt-10">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="group border-2 border-purple-100 bg-gradient-to-br from-purple-50 to-white transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-purple-500/30">
                  <CardContent className="pt-6">
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg transition-transform group-hover:scale-110 group-hover:shadow-purple-500/50">
                      <BarChart3 className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="mb-2 text-lg font-bold">통합 대시보드</h3>
                    <p className="text-sm text-muted-foreground">
                      시장 전체의 매출, 방문자, 인기 상품 등을 한 눈에 확인하세요
                    </p>
                  </CardContent>
                </Card>

                <Card className="group border-2 border-purple-100 bg-gradient-to-br from-purple-50 to-white transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-500/30">
                  <CardContent className="pt-6">
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg transition-transform group-hover:scale-110 group-hover:shadow-blue-500/50">
                      <MessageSquare className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="mb-2 text-lg font-bold">공동 마케팅</h3>
                    <p className="text-sm text-muted-foreground">
                      시장 전체 캠페인을 한 번에 관리하고 성과를 측정하세요
                    </p>
                  </CardContent>
                </Card>

                <Card className="group border-2 border-purple-100 bg-gradient-to-br from-purple-50 to-white transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-green-500/30">
                  <CardContent className="pt-6">
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-green-600 shadow-lg transition-transform group-hover:scale-110 group-hover:shadow-green-500/50">
                      <CheckCircle2 className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="mb-2 text-lg font-bold">상점 승인 관리</h3>
                    <p className="text-sm text-muted-foreground">
                      새로운 상점 등록을 검토하고 승인 관리를 간편하게 하세요
                    </p>
                  </CardContent>
                </Card>

                <Card className="group border-2 border-purple-100 bg-gradient-to-br from-purple-50 to-white transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-pink-500/30">
                  <CardContent className="pt-6">
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 to-pink-600 shadow-lg transition-transform group-hover:scale-110 group-hover:shadow-pink-500/50">
                      <TrendingUp className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="mb-2 text-lg font-bold">매출 분석</h3>
                    <p className="text-sm text-muted-foreground">
                      시장 전체 매출 추이와 트렌드를 데이터로 확인하세요
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="customer" className="mt-10">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="group border-2 border-green-100 bg-gradient-to-br from-green-50 to-white transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-green-500/30">
                  <CardContent className="pt-6">
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-green-600 shadow-lg transition-transform group-hover:scale-110 group-hover:shadow-green-500/50">
                      <Sparkles className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="mb-2 text-lg font-bold">AI 맞춤 추천</h3>
                    <p className="text-sm text-muted-foreground">
                      내 취향과 구매 패턴을 분석해 딱 맞는 상품을 추천해드려요
                    </p>
                  </CardContent>
                </Card>

                <Card className="group border-2 border-green-100 bg-gradient-to-br from-green-50 to-white transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-500/30">
                  <CardContent className="pt-6">
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg transition-transform group-hover:scale-110 group-hover:shadow-blue-500/50">
                      <Search className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="mb-2 text-lg font-bold">통합 검색</h3>
                    <p className="text-sm text-muted-foreground">
                      시장 전체 상품을 한 번에 검색하고 가격을 비교할 수 있어요
                    </p>
                  </CardContent>
                </Card>

                <Card className="group border-2 border-green-100 bg-gradient-to-br from-green-50 to-white transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-pink-500/30">
                  <CardContent className="pt-6">
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 to-pink-600 shadow-lg transition-transform group-hover:scale-110 group-hover:shadow-pink-500/50">
                      <Heart className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="mb-2 text-lg font-bold">단골 상점</h3>
                    <p className="text-sm text-muted-foreground">
                      자주 가는 상점을 등록하고 타임세일 소식을 가장 먼저 받아보세요
                    </p>
                  </CardContent>
                </Card>

                <Card className="group border-2 border-green-100 bg-gradient-to-br from-green-50 to-white transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-purple-500/30">
                  <CardContent className="pt-6">
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg transition-transform group-hover:scale-110 group-hover:shadow-purple-500/50">
                      <Zap className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="mb-2 text-lg font-bold">실시간 알림</h3>
                    <p className="text-sm text-muted-foreground">
                      타임세일, 신상품 등 놓치면 안 되는 소식을 실시간으로 알려드려요
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-20 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center mb-12">
            <Badge variant="outline" className="mb-4 border-pink-200 text-pink-700">
              고객 후기
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
              실제 사용자들의 생생한 후기
            </h2>
            <p className="text-muted-foreground">
              MarketSphere로 성장한 소상공인과 만족한 고객들의 이야기
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <Card
                key={index}
                className="group border-2 bg-white/80 backdrop-blur-sm transition-all hover:-translate-y-2 hover:shadow-2xl hover:shadow-purple-500/20 hover:bg-white/90"
              >
                <CardContent className="pt-6">
                  <div className="mb-4">
                    <Quote className="h-8 w-8 text-purple-400 transition-all group-hover:text-purple-600 group-hover:scale-110" />
                  </div>
                  <div className="mb-4 flex gap-1">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star
                        key={i}
                        className="h-4 w-4 fill-yellow-400 text-yellow-400 transition-transform group-hover:scale-110"
                      />
                    ))}
                  </div>
                  <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
                    {testimonial.content}
                  </p>
                  <div className="border-t pt-4">
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="container max-w-3xl">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4 border-blue-200 text-blue-700">
              자주 묻는 질문
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
              궁금한 점이 있으신가요?
            </h2>
            <p className="text-muted-foreground">
              MarketSphere 사용에 대해 자주 묻는 질문을 확인하세요
            </p>
          </div>

          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-left">
                MarketSphere는 어떤 서비스인가요?
              </AccordionTrigger>
              <AccordionContent>
                MarketSphere는 AI 기반 전통시장 디지털 혁신 플랫폼입니다. 소상공인의 마케팅 자동화,
                상인회의 통합 관리, 고객의 스마트한 쇼핑 경험을 모두 제공하는 종합 솔루션입니다.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger className="text-left">
                무료 체험 기간은 얼마나 되나요?
              </AccordionTrigger>
              <AccordionContent>
                첫 달은 모든 기능을 무료로 사용하실 수 있습니다. 신용카드 등록 없이 간단한 정보
                입력만으로 즉시 시작할 수 있으며, 체험 기간 종료 후 자동으로 과금되지 않습니다.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3">
              <AccordionTrigger className="text-left">
                AI가 정말 마케팅을 대신 해주나요?
              </AccordionTrigger>
              <AccordionContent>
                네, AI가 상품 설명 생성, 타임세일 자동 진행, 날씨 기반 프로모션, 고객 맞춤 추천 등의
                마케팅 활동을 자동으로 수행합니다. 상점주님은 상품 정보만 등록하면 AI가 나머지를
                처리해드립니다.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4">
              <AccordionTrigger className="text-left">
                기술에 익숙하지 않은데 사용할 수 있을까요?
              </AccordionTrigger>
              <AccordionContent>
                물론입니다! MarketSphere는 누구나 쉽게 사용할 수 있도록 직관적으로 설계되었습니다.
                또한 전담 고객 지원팀이 사용법을 자세히 안내해드리며, 온라인 교육 자료도 제공됩니다.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5">
              <AccordionTrigger className="text-left">요금제는 어떻게 되나요?</AccordionTrigger>
              <AccordionContent>
                소상공인 기본 플랜은 월 29,000원부터 시작하며, 상점 규모와 필요한 기능에 따라 다양한
                요금제가 있습니다. 상인회는 별도 문의를 통해 맞춤 견적을 제공해드립니다. 고객 앱
                사용은 무료입니다.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-6">
              <AccordionTrigger className="text-left">
                기존 POS 시스템과 연동이 가능한가요?
              </AccordionTrigger>
              <AccordionContent>
                대부분의 POS 시스템과 연동 가능합니다. 주요 POS 제조사(포스뱅크, 파트너스, OK포스
                등)와 이미 연동되어 있으며, 기타 시스템도 API를 통해 연동할 수 있습니다.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative overflow-hidden py-20 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 animate-gradient bg-[length:200%_200%]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent_50%)]"></div>
        <div className="container relative z-10">
          <div className="mx-auto max-w-3xl text-center text-white">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-6">
              지금 바로 시작하세요
            </h2>
            <p className="text-lg mb-10 text-blue-100">
              첫 달 무료로 모든 기능을 체험하고,
              <br />
              전통시장의 디지털 혁신에 동참하세요.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button
                size="lg"
                className="group relative h-14 overflow-hidden bg-white px-8 text-base text-purple-600 transition-all hover:shadow-2xl hover:shadow-white/50 hover:scale-105"
                asChild
              >
                <Link href="/sign-up">
                  <span className="relative z-10">무료로 시작하기</span>
                  <ArrowRight className="relative z-10 ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  <div className="absolute inset-0 -z-0 bg-gradient-to-r from-purple-500/0 via-purple-500/20 to-purple-500/0 opacity-0 group-hover:animate-shimmer group-hover:opacity-100"></div>
                  <BorderBeam
                    size={250}
                    duration={12}
                    delay={0}
                    colorFrom="#c084fc"
                    colorTo="#f472b6"
                  />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-14 border-2 border-white px-8 text-base text-white transition-all hover:bg-white/20 hover:scale-105"
                asChild
              >
                <Link href="/contact">문의하기</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
