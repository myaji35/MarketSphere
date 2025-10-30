import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'MarketSphere - 전통시장 디지털 혁신 플랫폼',
  description: 'AI 기반 전통시장 소상공인 마케팅 자동화 플랫폼',
}

const isDevMode = process.env.NEXT_PUBLIC_DEV_MODE === 'true'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // 개발 모드에서는 ClerkProvider 없이 렌더링
  if (isDevMode) {
    return (
      <html lang="ko">
        <body className={inter.className}>
          {children}
          <Toaster />
        </body>
      </html>
    )
  }

  // 프로덕션 모드에서는 ClerkProvider 사용
  return (
    <ClerkProvider>
      <html lang="ko">
        <body className={inter.className}>
          {children}
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  )
}
