import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Log whether DATABASE_URL is set (don't log the actual value!)
console.log("[Prisma] DATABASE_URL is set:", !!process.env.DATABASE_URL);
console.log("[Prisma] DIRECT_URL is set:", !!process.env.DIRECT_URL);

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
