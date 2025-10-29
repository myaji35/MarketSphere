import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ClerkProvider } from '@clerk/nextjs'
import { koKR } from '@clerk/localizations'
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "MarketSphere - 전통시장 디지털 혁신 플랫폼",
  description: "AI 기반 전통시장 소상공인 마케팅 자동화 플랫폼",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.NodeNode
}>) {
  return (
    <ClerkProvider localization={koKR}>
      <html lang="ko">
        <body className={inter.className}>{children}</body>
      </html>
    </ClerkProvider>
  )
}
