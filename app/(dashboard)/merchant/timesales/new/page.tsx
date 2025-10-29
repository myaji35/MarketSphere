import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { TimeSaleForm } from '@/components/forms/timesale-form';
import { getUserId } from '@/lib/get-user-id';

export default async function NewTimeSalePage() {
  const userId = await getUserId();

  if (!userId) {
    redirect('/sign-in');
  }

  const store = await prisma.store.findFirst({
    where: {
      ownerId: userId,
    },
  });

  if (!store) {
    redirect('/merchant/store/new');
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">타임세일 생성</h1>
        <p className="text-muted-foreground">
          버튼 클릭만으로 타임세일을 시작하고 단골 고객에게 알림을 보내세요
        </p>
      </div>

      <TimeSaleForm storeId={store.id} />
    </div>
  );
}
