import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Plus, Package } from 'lucide-react';
import { getUserId } from '@/lib/get-user-id';

export default async function ProductsPage() {
  const userId = await getUserId();

  if (!userId) {
    redirect('/sign-in');
  }

  const store = await prisma.store.findFirst({
    where: {
      ownerId: userId,
    },
    include: {
      products: {
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  });

  if (!store) {
    redirect('/merchant/store/new');
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">상품 관리</h1>
          <p className="text-muted-foreground">
            등록된 상품을 관리하고 새로운 상품을 추가하세요
          </p>
        </div>
        <Button asChild>
          <Link href="/merchant/products/new">
            <Plus className="mr-2 h-4 w-4" />
            상품 등록
          </Link>
        </Button>
      </div>

      {store.products.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <Package className="h-16 w-16 mx-auto text-muted-foreground" />
              <div>
                <h3 className="text-lg font-semibold">등록된 상품이 없습니다</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  첫 상품을 등록하고 AI 마케팅을 시작해보세요!
                </p>
              </div>
              <Button asChild>
                <Link href="/merchant/products/new">
                  <Plus className="mr-2 h-4 w-4" />
                  상품 등록하기
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {store.products.map((product) => (
            <Card key={product.id}>
              <CardHeader>
                <div className="aspect-square relative overflow-hidden rounded-lg bg-gray-100">
                  <img
                    src={product.imageUrl}
                    alt={product.productName}
                    className="object-cover w-full h-full"
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <CardTitle className="text-lg">{product.productName}</CardTitle>
                <div className="flex items-center gap-2">
                  {product.discountPrice ? (
                    <>
                      <span className="text-xl font-bold text-primary">
                        {product.discountPrice.toLocaleString()}원
                      </span>
                      <span className="text-sm line-through text-muted-foreground">
                        {product.price.toLocaleString()}원
                      </span>
                    </>
                  ) : (
                    <span className="text-xl font-bold">
                      {product.price.toLocaleString()}원
                    </span>
                  )}
                </div>
                {product.aiGeneratedDescription && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {product.aiGeneratedDescription}
                  </p>
                )}
                {product.aiGeneratedHashtags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {product.aiGeneratedHashtags.slice(0, 3).map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
                <div className="text-sm text-muted-foreground">
                  재고: {product.stock}개
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
