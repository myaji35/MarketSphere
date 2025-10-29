import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 시드 데이터 삽입 시작...')

  // 1. 상인회 생성
  const mangwonAssociation = await prisma.merchantAssociation.create({
    data: {
      name: '망원시장 상인회',
      presidentName: '김회장',
      contactPhone: '02-1234-5678',
      email: 'mangwon@market.com',
    },
  })

  console.log('✅ 상인회 생성:', mangwonAssociation.name)

  // 2. 시장 생성
  const mangwonMarket = await prisma.market.create({
    data: {
      marketName: '망원시장',
      associationId: mangwonAssociation.id,
      subdomainPrefix: 'mangwon',
      address: '서울특별시 마포구 망원동 123-45',
      latitude: 37.5563,
      longitude: 126.9024,
    },
  })

  console.log('✅ 시장 생성:', mangwonMarket.marketName)

  // 3. 테스트 사용자 생성 (상점주)
  const testMerchant = await prisma.user.create({
    data: {
      id: 'test_merchant_id_1',
      name: '김상인',
      email: 'merchant@test.com',
      phone: '010-1234-5678',
      role: 'MERCHANT',
    },
  })

  console.log('✅ 테스트 상점주 생성:', testMerchant.name)

  // 4. 상점 생성 (승인 완료 상태)
  const testStore = await prisma.store.create({
    data: {
      storeName: '김밥천국',
      subdomain: 'kimbapchunguk',
      marketId: mangwonMarket.id,
      ownerId: testMerchant.id,
      approvalStatus: 'APPROVED',
      approvedAt: new Date(),
      category: '분식',
      location: '3번 게이트 근처',
      phone: '010-1234-5678',
      hours: {
        open: '09:00',
        close: '20:00',
        closedDays: ['일요일'],
      },
      description: '신선한 재료로 만드는 김밥과 분식 전문점',
    },
  })

  console.log('✅ 테스트 상점 생성:', testStore.storeName)

  // 5. 상품 생성
  const product1 = await prisma.product.create({
    data: {
      storeId: testStore.id,
      productName: '참치김밥',
      price: 3500,
      imageUrl: 'https://placehold.co/600x400/png?text=Tuna+Kimbap',
      aiGeneratedDescription: '신선한 참치와 야채가 듬뿍! 오늘 아침에 만든 김밥입니다.',
      aiGeneratedHashtags: ['#참치김밥', '#망원시장', '#신선한', '#당일제조'],
      stock: 50,
      isAvailable: true,
    },
  })

  const product2 = await prisma.product.create({
    data: {
      storeId: testStore.id,
      productName: '떡볶이',
      price: 4000,
      discountPrice: 3000,
      imageUrl: 'https://placehold.co/600x400/png?text=Tteokbokki',
      aiGeneratedDescription: '매콤달콤한 떡볶이 오늘만 특가!',
      aiGeneratedHashtags: ['#떡볶이', '#타임세일', '#망원시장', '#분식'],
      stock: 30,
      isAvailable: true,
    },
  })

  console.log('✅ 상품 생성:', product1.productName, product2.productName)

  // 6. 타임세일 생성
  const timeSale = await prisma.timeSale.create({
    data: {
      storeId: testStore.id,
      title: '떡볶이 30% 할인',
      description: '오후 5시까지만! 떡볶이 특가',
      discountRate: 30,
      startTime: new Date(),
      endTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2시간 후
      isActive: true,
    },
  })

  console.log('✅ 타임세일 생성:', timeSale.title)

  // 7. 테스트 고객 생성
  const testCustomer = await prisma.user.create({
    data: {
      id: 'test_customer_id_1',
      name: '이고객',
      email: 'customer@test.com',
      phone: '010-9876-5432',
      role: 'CUSTOMER',
    },
  })

  console.log('✅ 테스트 고객 생성:', testCustomer.name)

  // 8. 단골 등록
  await prisma.favorite.create({
    data: {
      userId: testCustomer.id,
      storeId: testStore.id,
    },
  })

  console.log('✅ 단골 등록 완료')

  console.log('🎉 시드 데이터 삽입 완료!')
}

main()
  .catch((e) => {
    console.error('❌ 시드 데이터 삽입 실패:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
