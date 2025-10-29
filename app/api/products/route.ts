import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserId } from '@/lib/get-user-id';

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserId();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      storeId,
      productName,
      price,
      discountPrice,
      imageUrl,
      aiGeneratedDescription,
      aiGeneratedHashtags,
      stock,
    } = body;

    // 상점 소유권 확인
    const store = await prisma.store.findFirst({
      where: {
        id: storeId,
        ownerId: userId,
      },
    });

    if (!store) {
      return NextResponse.json(
        { error: 'Store not found or unauthorized' },
        { status: 403 }
      );
    }

    // 상품 생성
    const product = await prisma.product.create({
      data: {
        storeId,
        productName,
        price: parseInt(price),
        discountPrice: discountPrice ? parseInt(discountPrice) : null,
        imageUrl,
        aiGeneratedDescription,
        aiGeneratedHashtags: aiGeneratedHashtags || [],
        stock: parseInt(stock) || 0,
        isAvailable: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const userId = await getUserId();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const storeId = searchParams.get('storeId');

    if (!storeId) {
      return NextResponse.json(
        { error: 'Store ID is required' },
        { status: 400 }
      );
    }

    // 상점 소유권 확인
    const store = await prisma.store.findFirst({
      where: {
        id: storeId,
        ownerId: userId,
      },
    });

    if (!store) {
      return NextResponse.json(
        { error: 'Store not found or unauthorized' },
        { status: 403 }
      );
    }

    // 상품 목록 조회
    const products = await prisma.product.findMany({
      where: {
        storeId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
