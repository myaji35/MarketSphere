import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { ProductForm } from '@/components/forms/product-form'
import { getUserId } from '@/lib/get-user-id'

export default async function NewProductPage() {
  const userId = await getUserId()

  if (!userId) {
    redirect('/sign-in')
  }

  // 사용자의 상점 조회
  const store = await prisma.store.findFirst({
    where: {
      ownerId: userId,
    },
  })

  if (!store) {
    redirect('/merchant/store/new')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">상품 등록</h1>
        <p className="text-muted-foreground">
          새로운 상품을 등록하고 AI가 자동으로 마케팅 콘텐츠를 생성합니다.
        </p>
      </div>

      <ProductForm storeId={store.id} />
    </div>
  )
}
