/**
 * 토스페이먼츠 API 유틸리티
 */

const TOSS_API_BASE_URL = 'https://api.tosspayments.com/v1'
const TOSS_SECRET_KEY = process.env.TOSS_SECRET_KEY!

/**
 * 토스페이먼츠 API 호출
 */
async function tossApiCall(endpoint: string, options: RequestInit = {}) {
  const url = `${TOSS_API_BASE_URL}${endpoint}`

  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Basic ${Buffer.from(TOSS_SECRET_KEY + ':').toString('base64')}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`Toss API Error: ${error.message || response.statusText}`)
  }

  return response.json()
}

/**
 * 빌링키 발급 요청
 */
export interface IssueBillingKeyParams {
  customerKey: string // 고객 고유 ID (Clerk User ID 사용)
  authKey: string // 카드 인증키
}

export async function issueBillingKey(params: IssueBillingKeyParams) {
  return tossApiCall('/billing/authorizations/issue', {
    method: 'POST',
    body: JSON.stringify(params),
  })
}

/**
 * 빌링키로 자동 결제
 */
export interface BillingPaymentParams {
  billingKey: string
  customerKey: string
  amount: number
  orderId: string
  orderName: string
  customerEmail?: string
  customerName?: string
}

export async function chargeBilling(params: BillingPaymentParams) {
  return tossApiCall(`/billing/${params.billingKey}`, {
    method: 'POST',
    body: JSON.stringify({
      customerKey: params.customerKey,
      amount: params.amount,
      orderId: params.orderId,
      orderName: params.orderName,
      customerEmail: params.customerEmail,
      customerName: params.customerName,
    }),
  })
}

/**
 * 결제 승인 (일회성 결제)
 */
export interface ConfirmPaymentParams {
  paymentKey: string
  orderId: string
  amount: number
}

export async function confirmPayment(params: ConfirmPaymentParams) {
  return tossApiCall('/payments/confirm', {
    method: 'POST',
    body: JSON.stringify(params),
  })
}

/**
 * 결제 조회
 */
export async function getPayment(paymentKey: string) {
  return tossApiCall(`/payments/${paymentKey}`, {
    method: 'GET',
  })
}

/**
 * 결제 취소
 */
export interface CancelPaymentParams {
  paymentKey: string
  cancelReason: string
}

export async function cancelPayment(params: CancelPaymentParams) {
  return tossApiCall(`/payments/${params.paymentKey}/cancel`, {
    method: 'POST',
    body: JSON.stringify({
      cancelReason: params.cancelReason,
    }),
  })
}

/**
 * 빌링키 조회
 */
export async function getBillingKey(billingKey: string) {
  return tossApiCall(`/billing/authorizations/${billingKey}`, {
    method: 'GET',
  })
}

/**
 * 빌링키 삭제 (구독 취소)
 */
export async function deleteBillingKey(billingKey: string, customerKey: string) {
  return tossApiCall(`/billing/authorizations/${billingKey}`, {
    method: 'DELETE',
    body: JSON.stringify({ customerKey }),
  })
}

/**
 * 구독 가격 정보
 */
export const SUBSCRIPTION_PLANS = {
  BASIC: {
    name: '기본',
    price: 10000, // 월 10,000원
    features: [
      'AI 콘텐츠 생성',
      '푸시 알림',
      '기본 챗봇',
      '월 100건 AI 생성',
    ],
  },
  PREMIUM: {
    name: '프리미엄',
    price: 20000, // 월 20,000원
    features: [
      '기본 플랜 모든 기능',
      '고급 AI 콘텐츠 생성',
      '광고 자동 집행',
      '월 무제한 AI 생성',
      '우선 고객 지원',
    ],
  },
} as const

/**
 * 구독 플랜 가격 가져오기
 */
export function getSubscriptionPrice(plan: 'BASIC' | 'PREMIUM'): number {
  return SUBSCRIPTION_PLANS[plan].price
}
