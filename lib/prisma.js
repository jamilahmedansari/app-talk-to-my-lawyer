import { PrismaClient } from '@prisma/client'

// Initialize Prisma Client
let prisma;

if (!global.prisma) {
  // Check if DATABASE_URL is available
  if (!process.env.DATABASE_URL) {
    console.warn('DATABASE_URL not found. Prisma client will not be initialized.');
    // Create a mock client for development
    global.prisma = {
      $queryRaw: async () => {
        throw new Error('DATABASE_URL not configured. Please set DATABASE_URL in your environment variables.');
      },
      $connect: async () => {
        console.warn('Cannot connect to database: DATABASE_URL not configured');
      },
      $disconnect: async () => {
        console.warn('Cannot disconnect from database: DATABASE_URL not configured');
      },
      // Add other commonly used methods as needed
      user: { findMany: async () => [], create: async () => null, update: async () => null, delete: async () => null },
      letter: { findMany: async () => [], create: async () => null, update: async () => null, delete: async () => null },
      document: { findMany: async () => [], create: async () => null, update: async () => null, delete: async () => null },
      webhookLog: { create: async () => null },
    };
  } else {
    global.prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
  }
}

prisma = global.prisma;

export default prisma;
