let prisma: any;

try {
  const { PrismaClient } = require("@prisma/client");
  const globalForPrisma = globalThis as unknown as {
    prisma: typeof PrismaClient | undefined;
  };
  prisma = globalForPrisma.prisma ?? new PrismaClient();
  if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
} catch (e) {
  console.warn("Prisma client not available - run prisma generate");
  prisma = null;
}

export { prisma };
