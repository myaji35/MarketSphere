import { NextRequest, NextResponse } from 'next/server'
import { processBillingCycle } from '@/app/actions/subscription-actions'

/**
 * 정기 결제 Cron Job
 * Vercel Cron 또는 외부 Cron 서비스에서 호출
 *
 * 설정:
 * - vercel.json에 cron 설정 추가
 * - 매일 오전 9시 실행
 */
export async function GET(request: NextRequest) {
  // Authorization 헤더로 보안 강화
  const authHeader = request.headers.get('authorization')
  const CRON_SECRET = process.env.CRON_SECRET || 'your-cron-secret'

  if (authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await processBillingCycle()

    return NextResponse.json({
      success: true,
      message: 'Billing cycle processed',
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error('Cron job error:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    )
  }
}
