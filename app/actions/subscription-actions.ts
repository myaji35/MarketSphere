"use server"

import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { chargeBilling, issueBillingKey, deleteBillingKey, getSubscriptionPrice } from '@/lib/toss'
import { v4 as uuidv4 } from 'uuid'
import { revalidatePath } from 'next/cache'

/**
 * 구독 생성 (빌링키 발급 후)
 */
export async function createSubscription(data: {
  plan: 'BASIC' | 'PREMIUM'
  authKey: string // 토스페이먼츠 카드 인증키
  storeId?: string
}) {
  const { userId } = auth()
  if (!userId) throw new Error('Unauthorized')

  // 1. 빌링키 발급
  const billingKeyResponse = await issueBillingKey({
    customerKey: userId, // Clerk User ID를 고객 키로 사용
    authKey: data.authKey,
  })

  const billingKey = billingKeyResponse.billingKey

  // 2. 구독 생성
  const amount = getSubscriptionPrice(data.plan)
  const now = new Date()
  const nextBillingDate = new Date(now)
  nextBillingDate.setMonth(nextBillingDate.getMonth() + 1) // 다음 달 같은 날

  const subscription = await prisma.subscription.create({
    data: {
      userId,
      storeId: data.storeId,
      plan: data.plan,
      status: 'PENDING',
      billingKey,
      customerKey: userId,
      amount,
      nextBillingDate,
    },
  })

  // 3. 첫 결제 시도
  try {
    const orderId = `order_${uuidv4()}`
    const paymentResponse = await chargeBilling({
      billingKey,
      customerKey: userId,
      amount,
      orderId,
      orderName: `MarketSphere ${data.plan} 구독 (첫 결제)`,
    })

    // 4. 결제 성공 시 구독 활성화 및 결제 내역 저장
    await prisma.$transaction([
      // 구독 상태 업데이트
      prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          status: 'ACTIVE',
          startDate: now,
          endDate: nextBillingDate,
        },
      }),
      // 결제 내역 저장
      prisma.payment.create({
        data: {
          subscriptionId: subscription.id,
          userId,
          paymentKey: paymentResponse.paymentKey,
          orderId,
          amount,
          method: paymentResponse.method,
          status: 'DONE',
          requestedAt: now,
          approvedAt: now,
        },
      }),
    ])

    revalidatePath('/dashboard/subscription')

    return {
      success: true,
      subscriptionId: subscription.id,
      message: '구독이 시작되었습니다!',
    }
  } catch (error: any) {
    // 결제 실패 시 구독 상태 업데이트
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: 'FAILED',
      },
    })

    throw new Error(`결제 실패: ${error.message}`)
  }
}

/**
 * 구독 취소
 */
export async function cancelSubscription(subscriptionId: string, reason: string) {
  const { userId } = auth()
  if (!userId) throw new Error('Unauthorized')

  const subscription = await prisma.subscription.findUnique({
    where: { id: subscriptionId },
  })

  if (!subscription || subscription.userId !== userId) {
    throw new Error('구독을 찾을 수 없습니다')
  }

  // 1. 토스페이먼츠 빌링키 삭제
  if (subscription.billingKey) {
    await deleteBillingKey(subscription.billingKey, subscription.customerKey)
  }

  // 2. 구독 취소 처리
  await prisma.subscription.update({
    where: { id: subscriptionId },
    data: {
      status: 'CANCELLED',
      cancelledAt: new Date(),
      cancelReason: reason,
    },
  })

  revalidatePath('/dashboard/subscription')

  return {
    success: true,
    message: '구독이 취소되었습니다',
  }
}

/**
 * 현재 구독 정보 조회
 */
export async function getCurrentSubscription() {
  const { userId } = auth()
  if (!userId) throw new Error('Unauthorized')

  const subscription = await prisma.subscription.findFirst({
    where: {
      userId,
      status: 'ACTIVE',
    },
    include: {
      store: true,
      payments: {
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
    },
  })

  return subscription
}

/**
 * 구독 플랜 변경
 */
export async function changeSubscriptionPlan(
  subscriptionId: string,
  newPlan: 'BASIC' | 'PREMIUM'
) {
  const { userId } = auth()
  if (!userId) throw new Error('Unauthorized')

  const subscription = await prisma.subscription.findUnique({
    where: { id: subscriptionId },
  })

  if (!subscription || subscription.userId !== userId) {
    throw new Error('구독을 찾을 수 없습니다')
  }

  const newAmount = getSubscriptionPrice(newPlan)

  await prisma.subscription.update({
    where: { id: subscriptionId },
    data: {
      plan: newPlan,
      amount: newAmount,
    },
  })

  revalidatePath('/dashboard/subscription')

  return {
    success: true,
    message: '구독 플랜이 변경되었습니다',
  }
}

/**
 * 정기 결제 실행 (Cron Job에서 호출)
 */
export async function processBillingCycle() {
  const now = new Date()

  // 오늘 결제일인 활성 구독 조회
  const subscriptions = await prisma.subscription.findMany({
    where: {
      status: 'ACTIVE',
      nextBillingDate: {
        lte: now,
      },
    },
  })

  console.log(`🔄 정기 결제 시작: ${subscriptions.length}건`)

  for (const subscription of subscriptions) {
    try {
      const orderId = `order_${uuidv4()}`

      // 자동 결제
      const paymentResponse = await chargeBilling({
        billingKey: subscription.billingKey!,
        customerKey: subscription.customerKey,
        amount: subscription.amount,
        orderId,
        orderName: `MarketSphere ${subscription.plan} 구독 (${now.toLocaleDateString()})`,
      })

      // 결제 성공
      await prisma.$transaction([
        // 결제 내역 저장
        prisma.payment.create({
          data: {
            subscriptionId: subscription.id,
            userId: subscription.userId,
            paymentKey: paymentResponse.paymentKey,
            orderId,
            amount: subscription.amount,
            method: paymentResponse.method,
            status: 'DONE',
            requestedAt: now,
            approvedAt: now,
          },
        }),
        // 다음 결제일 업데이트
        prisma.subscription.update({
          where: { id: subscription.id },
          data: {
            nextBillingDate: new Date(now.setMonth(now.getMonth() + 1)),
            endDate: new Date(now.setMonth(now.getMonth() + 1)),
          },
        }),
      ])

      console.log(`✅ 결제 성공: ${subscription.id}`)
    } catch (error: any) {
      console.error(`❌ 결제 실패: ${subscription.id}`, error)

      // 결제 실패 처리
      await prisma.$transaction([
        // 실패 결제 내역 저장
        prisma.payment.create({
          data: {
            subscriptionId: subscription.id,
            userId: subscription.userId,
            paymentKey: '',
            orderId: `order_${uuidv4()}`,
            amount: subscription.amount,
            status: 'FAILED',
            requestedAt: now,
            failReason: error.message,
          },
        }),
        // 구독 상태 변경
        prisma.subscription.update({
          where: { id: subscription.id },
          data: {
            status: 'FAILED',
          },
        }),
      ])

      // TODO: 결제 실패 알림 발송
    }
  }

  console.log(`✅ 정기 결제 완료`)
}
