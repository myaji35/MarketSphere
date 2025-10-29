import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Plus, Timer, Clock, TrendingDown } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { getUserId } from '@/lib/get-user-id';

export default async function TimeSalesPage() {
  const userId = await getUserId();

  if (!userId) {
    redirect('/sign-in');
  }

  const store = await prisma.store.findFirst({
    where: {
      ownerId: userId,
    },
    include: {
      timeSales: {
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  });

  if (!store) {
    redirect('/merchant/store/new');
  }

  const now = new Date();
  const activeTimeSales = store.timeSales.filter(
    (ts) => ts.isActive && ts.startTime <= now && ts.endTime >= now
  );
  const upcomingTimeSales = store.timeSales.filter(
    (ts) => ts.isActive && ts.startTime > now
  );
  const pastTimeSales = store.timeSales.filter(
    (ts) => !ts.isActive || ts.endTime < now
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">타임세일 관리</h1>
          <p className="text-muted-foreground">
            타임세일을 관리하고 단골 고객에게 알림을 보내세요
          </p>
        </div>
        <Button asChild>
          <Link href="/merchant/timesales/new">
            <Plus className="mr-2 h-4 w-4" />
            타임세일 시작
          </Link>
        </Button>
      </div>

      {/* 활성 타임세일 */}
      {activeTimeSales.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Timer className="h-5 w-5 text-green-500" />
            진행 중인 타임세일
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {activeTimeSales.map((timeSale) => (
              <Card key={timeSale.id} className="border-green-200">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="text-lg">{timeSale.title}</span>
                    <span className="text-2xl font-bold text-green-600">
                      -{timeSale.discountRate}%
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {timeSale.description && (
                    <p className="text-sm text-muted-foreground">
                      {timeSale.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4" />
                    <span>
                      {format(timeSale.endTime, 'M월 d일 HH:mm', { locale: ko })}까지
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* 예정된 타임세일 */}
      {upcomingTimeSales.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-500" />
            예정된 타임세일
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {upcomingTimeSales.map((timeSale) => (
              <Card key={timeSale.id} className="border-blue-200">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="text-lg">{timeSale.title}</span>
                    <span className="text-2xl font-bold text-blue-600">
                      -{timeSale.discountRate}%
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {timeSale.description && (
                    <p className="text-sm text-muted-foreground">
                      {timeSale.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4" />
                    <span>
                      {format(timeSale.startTime, 'M월 d일 HH:mm', { locale: ko })}부터
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* 종료된 타임세일 */}
      {pastTimeSales.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-gray-400" />
            종료된 타임세일
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {pastTimeSales.slice(0, 4).map((timeSale) => (
              <Card key={timeSale.id} className="opacity-60">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="text-lg">{timeSale.title}</span>
                    <span className="text-xl font-bold text-gray-500">
                      -{timeSale.discountRate}%
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>
                      {format(timeSale.endTime, 'M월 d일 HH:mm', { locale: ko })} 종료
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* 타임세일이 없는 경우 */}
      {store.timeSales.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <Timer className="h-16 w-16 mx-auto text-muted-foreground" />
              <div>
                <h3 className="text-lg font-semibold">
                  타임세일을 시작해보세요
                </h3>
                <p className="text-sm text-muted-foreground mt-2">
                  버튼 클릭만으로 타임세일을 시작하고 단골 고객에게 알림을 보낼 수 있습니다.
                </p>
              </div>
              <Button asChild>
                <Link href="/merchant/timesales/new">
                  <Plus className="mr-2 h-4 w-4" />
                  타임세일 시작하기
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
