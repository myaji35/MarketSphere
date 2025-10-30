'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UserButton } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { Store, Package, Timer, BarChart3, Settings, Home, User } from 'lucide-react'

const isDevMode = process.env.NEXT_PUBLIC_DEV_MODE === 'true'

const merchantNavItems = [
  {
    title: '대시보드',
    href: '/merchant',
    icon: Home,
  },
  {
    title: '내 상점',
    href: '/merchant/store',
    icon: Store,
  },
  {
    title: '상품 관리',
    href: '/merchant/products',
    icon: Package,
  },
  {
    title: '타임세일',
    href: '/merchant/timesales',
    icon: Timer,
  },
  {
    title: '통계',
    href: '/merchant/analytics',
    icon: BarChart3,
  },
  {
    title: '설정',
    href: '/merchant/settings',
    icon: Settings,
  },
]

export function DashboardNav() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white">
      <div className="container flex h-16 items-center px-4 lg:px-8">
        <div className="mr-8 flex items-center">
          <Link href="/merchant" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-primary">MarketSphere</span>
          </Link>
        </div>

        <nav className="flex items-center space-x-1 flex-1">
          {merchantNavItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')

            return (
              <Button key={item.href} variant={isActive ? 'secondary' : 'ghost'} size="sm" asChild>
                <Link href={item.href} className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{item.title}</span>
                </Link>
              </Button>
            )
          })}
        </nav>

        <div className="ml-auto flex items-center space-x-4">
          {isDevMode ? (
            <Button variant="outline" size="sm">
              <User className="h-4 w-4 mr-2" />
              개발모드
            </Button>
          ) : (
            <UserButton afterSignOutUrl="/" />
          )}
        </div>
      </div>
    </header>
  )
}
