import { auth as clerkAuth, currentUser } from '@clerk/nextjs/server'

/**
 * 서버 컴포넌트/Server Actions에서 현재 인증 정보 가져오기
 */
export async function getAuth() {
  const { userId, sessionId } = clerkAuth()
  return { userId, sessionId }
}

/**
 * 현재 로그인한 사용자 정보 가져오기
 */
export async function getCurrentUser() {
  return await currentUser()
}

/**
 * 사용자 역할 확인
 */
export async function getUserRole(): Promise<string | null> {
  const user = await currentUser()
  if (!user) return null

  // Clerk의 publicMetadata에서 role 가져오기
  return (user.publicMetadata.role as string) || 'CUSTOMER'
}

/**
 * 권한 확인
 */
export async function checkRole(requiredRole: string): Promise<boolean> {
  const role = await getUserRole()
  return role === requiredRole
}

/**
 * 상점 소유자 확인
 */
export async function isStoreOwner(storeId: string): Promise<boolean> {
  const { userId } = clerkAuth()
  if (!userId) return false

  // Prisma로 상점 소유자 확인
  const { prisma } = await import('./prisma')
  const store = await prisma.store.findUnique({
    where: { id: storeId },
    select: { ownerId: true },
  })

  return store?.ownerId === userId
}

/**
 * 상인회 관리자 확인
 */
export async function isAssociationAdmin(associationId: string): Promise<boolean> {
  const { userId } = clerkAuth()
  if (!userId) return false

  const { prisma } = await import('./prisma')
  const admin = await prisma.associationAdmin.findUnique({
    where: {
      userId_associationId: {
        userId,
        associationId,
      },
    },
  })

  return !!admin
}
