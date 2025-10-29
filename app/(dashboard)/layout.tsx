import { ReactNode } from 'react';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { DashboardNav } from '@/components/layout/dashboard-nav';
import { isDevMode } from '@/lib/dev-auth';

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  // 개발 모드가 아닐 때만 인증 확인
  if (!isDevMode()) {
    const { userId } = await auth();
    if (!userId) {
      redirect('/sign-in');
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {isDevMode() && (
        <div className="bg-yellow-100 border-b border-yellow-300 px-4 py-2 text-center text-sm text-yellow-800">
          🚧 개발 모드 - 더미 데이터로 테스트 중입니다
        </div>
      )}
      <DashboardNav />
      <main className="container mx-auto py-6 px-4 lg:px-8">
        {children}
      </main>
    </div>
  );
}
