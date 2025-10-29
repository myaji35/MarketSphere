import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Package, Store, Timer, TrendingUp } from 'lucide-react';
import { isDevMode, DEV_USER_ID } from '@/lib/dev-auth';

export default async function MerchantDashboard() {
  let userId: string | null = null;

  if (isDevMode()) {
    userId = DEV_USER_ID;
  } else {
    const authResult = await auth();
    userId = authResult.userId;
    if (!userId) {
      redirect('/sign-in');
    }
  }

  // 사용자 상점 조회
  const stores = await prisma.store.findMany({
    where: {
      ownerId: userId,
    },
    include: {
      products: true,
      timeSales: true,
    },
  });

  const hasStore = stores.length > 0;
  const store = stores[0]; // 첫 번째 상점

  // 통계 계산
  const totalProducts = store?.products.length || 0;
  const activeTimeSales = store?.timeSales.filter((ts) => ts.isActive).length || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">대시보드</h1>
          <p className="text-muted-foreground">
            상점 운영 현황을 한눈에 확인하세요
          </p>
        </div>
        {!hasStore && (
          <Button asChild>
            <Link href="/merchant/store/new">상점 등록하기</Link>
          </Button>
        )}
      </div>

      {!hasStore ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <Store className="h-16 w-16 mx-auto text-muted-foreground" />
              <div>
                <h3 className="text-lg font-semibold">상점을 등록해주세요</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  MarketSphere에서 상점을 운영하려면 먼저 상점을 등록해야 합니다.
                </p>
              </div>
              <Button asChild>
                <Link href="/merchant/store/new">상점 등록하기</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* 통계 카드 */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  내 상점
                </CardTitle>
                <Store className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{store.storeName}</div>
                <p className="text-xs text-muted-foreground">
                  {store.category}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  등록 상품
                </CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalProducts}개</div>
                <p className="text-xs text-muted-foreground">
                  판매 중인 상품
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  활성 타임세일
                </CardTitle>
                <Timer className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeTimeSales}개</div>
                <p className="text-xs text-muted-foreground">
                  진행 중인 타임세일
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  이번 주 방문자
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">-</div>
                <p className="text-xs text-muted-foreground">
                  곧 제공 예정
                </p>
              </CardContent>
            </Card>
          </div>

          {/* 빠른 작업 */}
          <Card>
            <CardHeader>
              <CardTitle>빠른 작업</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Button asChild variant="outline" className="h-auto flex-col py-6 space-y-2">
                <Link href="/merchant/products/new">
                  <Package className="h-8 w-8" />
                  <span>상품 등록</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-auto flex-col py-6 space-y-2">
                <Link href="/merchant/timesales/new">
                  <Timer className="h-8 w-8" />
                  <span>타임세일 시작</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-auto flex-col py-6 space-y-2">
                <Link href="/merchant/store">
                  <Store className="h-8 w-8" />
                  <span>상점 관리</span>
                </Link>
              </Button>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
