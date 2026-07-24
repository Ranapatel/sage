require('dotenv').config()
const { PrismaClient } = require('@prisma/client')

const p = new PrismaClient()

async function main() {
  const count = await p.travelPhoto.count()
  console.log('=== TravelPhoto Records ===')
  console.log('Total photos in DB:', count)

  if (count > 0) {
    const photos = await p.travelPhoto.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        tripId: true,
        publicId: true,
        format: true,
        fileSize: true,
        secureUrl: true,
        createdAt: true,
      },
    })
    photos.forEach((ph, i) => {
      const url = (ph.secureUrl || '').substring(0, 80)
      console.log(`  ${i + 1}. id=${ph.id}`)
      console.log(`     tripId=${ph.tripId}`)
      console.log(`     publicId=${ph.publicId}`)
      console.log(`     format=${ph.format} size=${ph.fileSize}`)
      console.log(`     url=${url}...`)
      console.log(`     created=${ph.createdAt}`)
    })
  } else {
    console.log('  No photos in database yet.')
  }

  console.log('\n=== Cloudinary Config ===')
  console.log('Cloud:', process.env.CLOUDINARY_CLOUD_NAME || 'NOT SET')
  console.log('Key:', (process.env.CLOUDINARY_API_KEY || '').substring(0, 6) + '...')
  console.log('Secret:', process.env.CLOUDINARY_API_SECRET ? 'SET' : 'NOT SET')

  // Check trips count to see if any saved trips exist
  const tripCount = await p.trip.count()
  console.log('\n=== Trips ===')
  console.log('Total saved trips:', tripCount)

  if (tripCount > 0) {
    const trips = await p.trip.findMany({
      orderBy: { createdAt: 'desc' },
      take: 3,
      select: { id: true, destination: true, createdAt: true },
    })
    trips.forEach((t, i) => {
      console.log(`  ${i + 1}. id=${t.id} dest=${t.destination} created=${t.createdAt}`)
    })
  }

  await p.$disconnect()
}

main().catch(e => {
  console.error('Error:', e.message)
  p.$disconnect()
})
