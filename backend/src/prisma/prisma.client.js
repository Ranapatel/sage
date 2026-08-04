const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

/**
 * Startup validation function for Prisma.
 * Verifies that Prisma Client binary loads successfully and database connection works.
 */
async function validatePrismaClient() {
  console.log('[TripSage] 🔍 Validating Prisma Client engine & PostgreSQL connection...')
  
  if (!process.env.DATABASE_URL) {
    console.warn('[TripSage] ⚠️  DATABASE_URL environment variable is not set. Skipping Prisma DB check.')
    return false
  }

  try {
    await prisma.$connect()
    // Perform lightweight query verification
    await prisma.$queryRaw`SELECT 1;`
    console.log('[TripSage] ✅ Prisma Client engine loaded successfully & PostgreSQL connected.')
    return true
  } catch (err) {
    console.error('[TripSage] 💥 PRISMA ENGINE / DB INITIALIZATION ERROR!')
    console.error('[TripSage] Message:', err.message)
    console.error('[TripSage] Engine Diagnostics:', {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      nodeEnv: process.env.NODE_ENV,
    })

    if (process.env.NODE_ENV === 'production') {
      console.error('[TripSage] ❌ Fatal error in production: Unable to initialize Prisma Client engine. Exiting process.')
      process.exit(1)
    }
    return false
  }
}

module.exports = { prisma, validatePrismaClient }
module.exports.prisma = prisma
module.exports.validatePrismaClient = validatePrismaClient
