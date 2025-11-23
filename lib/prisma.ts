import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    datasources: {
      db: {
        url: process.env.DATABASE_URL, // pastikan variabel ini aktif di .env
      },
    },
  });

// 🧠 Reuse client agar tidak reconnect terus-menerus di dev mode
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
