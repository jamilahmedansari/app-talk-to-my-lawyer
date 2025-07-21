// Test Prisma connection
import prisma from './lib/prisma.js'

async function testConnection() {
  try {
    console.log('Testing Prisma connection...')
    const result = await prisma.$queryRaw`SELECT 1`
    console.log('✅ Prisma connection successful:', result)
    process.exit(0)
  } catch (error) {
    console.error('❌ Prisma connection failed:', error)
    process.exit(1)
  }
}

testConnection()
