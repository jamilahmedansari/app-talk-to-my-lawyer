import { PrismaClient } from '@prisma/client'

// Initialize Prisma Client
let prisma;

if (!global.prisma) {
  global.prisma = new PrismaClient();
}

prisma = global.prisma;

export default prisma;
