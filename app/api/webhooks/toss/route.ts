import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * 토스페이먼츠 Webhook 핸들러
 *
 * 이벤트:
 * - PAYMENT_CONFIRMED: 결제 승인
 * - PAYMENT_CANCELLED: 결제 취소
 * - VIRTUAL_ACCOUNT_ISSUED: 가상계좌 발급
 * - etc.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { eventType, data } = body

    console.log(`📬 토스페이먼츠 Webhook: ${eventType}`, data)

    switch (eventType) {
      case 'PAYMENT_CONFIRMED':
        await handlePaymentConfirmed(data)
        break

      case 'PAYMENT_CANCELLED':
        await handlePaymentCancelled(data)
        break

      default:
        console.log(`⚠️  처리되지 않은 이벤트: ${eventType}`)
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed', message: error.message },
      { status: 500 }
    )
  }
}

/**
 * 결제 승인 처리
 */
async function handlePaymentConfirmed(data: any) {
  const { paymentKey, orderId, status } = data

  if (status !== 'DONE') return

  // 결제 내역 업데이트
  await prisma.payment.updateMany({
    where: { orderId },
    data: {
      status: 'DONE',
      approvedAt: new Date(),
    },
  })

  console.log(`✅ 결제 승인 완료: ${orderId}`)
}

/**
 * 결제 취소 처리
 */
async function handlePaymentCancelled(data: any) {
  const { paymentKey, orderId, cancels } = data

  await prisma.payment.updateMany({
    where: { orderId },
    data: {
      status: 'CANCELLED',
    },
  })

  console.log(`❌ 결제 취소 완료: ${orderId}`)
}
