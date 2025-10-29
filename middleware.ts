import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// 개발 모드 체크
const isDevMode = process.env.NEXT_PUBLIC_DEV_MODE === 'true'

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks(.*)',
  '/stores(.*)', // 공개 상점 페이지
])

// 개발 모드용 middleware
function devMiddleware(request: NextRequest) {
  return NextResponse.next()
}

// 프로덕션 모드용 middleware
const prodMiddleware = clerkMiddleware((auth, request) => {
  if (!isPublicRoute(request)) {
    auth().protect()
  }
})

// 환경에 따라 적절한 middleware 내보내기
export default isDevMode ? devMiddleware : prodMiddleware

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
}
