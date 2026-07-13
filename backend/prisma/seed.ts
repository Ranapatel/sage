import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('[Prisma Seed] Starting database seeding...')

  // 1. Create a main test user
  const user = await prisma.user.upsert({
    where: { clerkUserId: 'user_seed_test_clerk_id_999' },
    update: {},
    create: {
      clerkUserId: 'user_seed_test_clerk_id_999',
      email: 'test_seed_user@example.com',
      firstName: 'John',
      lastName: 'Seed',
      profileImage: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde',
    },
  })

  // 2. Create a referred test user to support referrals relationships
  const referredUser = await prisma.user.upsert({
    where: { clerkUserId: 'user_referred_clerk_id_100' },
    update: {},
    create: {
      clerkUserId: 'user_referred_clerk_id_100',
      email: 'referred@example.com',
      firstName: 'Emily',
      lastName: 'Refer',
      profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
    },
  })

  console.log('[Prisma Seed] Synchronized test users:', user.email, referredUser.email)

  // Clear existing items for these users to prevent primary/unique key issues on repeat runs
  await prisma.referral.deleteMany({})
  await prisma.walletTransaction.deleteMany({})
  await prisma.wallet.deleteMany({})
  await prisma.savedItem.deleteMany({})
  await prisma.memory.deleteMany({})
  await prisma.travelPreference.deleteMany({})
  await prisma.userProfile.deleteMany({})
  await prisma.trip.deleteMany({
    where: { userId: user.id }
  })

  // 3. Seed UserProfile
  const profile = await prisma.userProfile.create({
    data: {
      userId: user.id,
      clerkUserId: user.clerkUserId,
      phoneNumber: '+1234567890',
      dateOfBirth: new Date('1990-01-01'),
      gender: 'Male',
      country: 'India',
      city: 'Mumbai',
      language: 'Hindi',
    }
  })
  console.log('[Prisma Seed] Seeded profile:', profile.city)

  // 4. Seed TravelPreference
  const preference = await prisma.travelPreference.create({
    data: {
      userId: user.id,
      travelStyle: 'adventure',
      budgetRange: 'medium',
      interests: ['Adventure', 'History', 'Nature'],
      foodPreference: ['Veg', 'Spicy'],
      accommodationPreference: 'hotel',
      tripDuration: '1 week',
    }
  })
  console.log('[Prisma Seed] Seeded preferences:', preference.interests)

  // 5. Seed SavedItems
  await prisma.savedItem.createMany({
    data: [
      {
        userId: user.id,
        type: 'hotel',
        referenceId: 'hotel_taj_palace_mumbai',
      },
      {
        userId: user.id,
        type: 'destination',
        referenceId: 'goa_india',
      },
      {
        userId: user.id,
        type: 'activity',
        referenceId: 'scuba_diving_grand_island',
      }
    ]
  })
  console.log('[Prisma Seed] Seeded saved items.')

  // 6. Seed Trip
  const trip = await prisma.trip.create({
    data: {
      userId: user.id,
      destination: 'Paris, France',
      title: 'Romantic Getaway',
      startDate: new Date('2026-09-01'),
      endDate: new Date('2026-09-07'),
      budget: 2500.0,
      travelers: 2,
      status: 'upcoming',
      itineraryDays: {
        create: [
          {
            dayNumber: 1,
            title: 'Arrival & Eiffel Tower',
            description: 'Arrive in Paris and explore the surrounding area.',
            activities: {
              create: [
                {
                  name: 'Eiffel Tower Sunset Tour',
                  description: 'Skip the line tickets to the Eiffel Tower summit at sunset.',
                  location: 'Champ de Mars, 5 Avenue Anatole France, 75007 Paris',
                  startTime: new Date('2026-09-01T18:00:00Z'),
                  endTime: new Date('2026-09-01T20:30:00Z'),
                  category: 'Sightseeing',
                },
              ],
            },
          },
        ],
      },
      travelPhotos: {
        create: [
          {
            userId: user.id,
            imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34',
            originalUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34',
            caption: 'Eiffel Tower at Dusk',
          },
        ],
      },
    },
  })
  console.log('[Prisma Seed] Seeded test trip:', trip.title)

  // 7. Seed Memories
  const memory = await prisma.memory.create({
    data: {
      userId: user.id,
      tripId: trip.id,
      title: 'Beautiful Seine River Cruise',
      description: 'Spent the evening cruising down the Seine river with French wine.',
      photos: ['https://images.unsplash.com/photo-1499856871958-5b9627545d1a'],
      location: 'Seine River, Paris',
    }
  })
  console.log('[Prisma Seed] Seeded travel memory:', memory.title)

  // 8. Seed Wallet and WalletTransaction
  const wallet = await prisma.wallet.create({
    data: {
      userId: user.id,
      balance: 600.0,
    }
  })

  await prisma.walletTransaction.createMany({
    data: [
      {
        userId: user.id,
        amount: 500.0,
        type: 'credit',
        reason: 'Welcome Sage Points Reward',
      },
      {
        userId: user.id,
        amount: 100.0,
        type: 'credit',
        reason: 'Referral Sign Up Bonus for inviting Emily Refer',
      }
    ]
  })
  console.log('[Prisma Seed] Seeded wallet ledger balance:', wallet.balance)

  // 9. Seed Referral
  const referral = await prisma.referral.create({
    data: {
      referrerId: user.id,
      referredUserId: referredUser.id,
      status: 'completed',
      reward: 100.0,
    }
  })
  console.log('[Prisma Seed] Seeded referral status:', referral.status)

  // 10. Seed Transport Providers
  await prisma.transportProviders.createMany({
    data: [
      { name: 'MakeMyTrip', type: 'train' },
      { name: 'RedBus', type: 'bus' },
      { name: 'Uber', type: 'cab' },
      { name: 'Air India', type: 'flight' }
    ]
  }).catch(e => console.warn('[Prisma Seed] TransportProviders seed skipped:', e.message))

  // 11. Seed Stations and RailwayStations
  await prisma.stations.createMany({
    data: [
      { name: 'Secunderabad Junction', code: 'SC', city: 'Hyderabad' },
      { name: 'Hubballi Junction', code: 'UBL', city: 'Hubballi' },
      { name: 'Madgaon Junction', code: 'MAO', city: 'Goa' },
      { name: 'Kanyakumari', code: 'CAPE', city: 'Kanyakumari' }
    ]
  }).catch(e => console.warn('[Prisma Seed] Stations seed skipped:', e.message))

  await prisma.railwayStations.createMany({
    data: [
      { name: 'Secunderabad Junction', code: 'SC', city: 'Hyderabad' },
      { name: 'Hubballi Junction', code: 'UBL', city: 'Hubballi' },
      { name: 'Madgaon Junction', code: 'MAO', city: 'Goa' }
    ]
  }).catch(e => console.warn('[Prisma Seed] RailwayStations seed skipped:', e.message))

  // 12. Seed BusStops
  await prisma.busStops.createMany({
    data: [
      { name: 'Hubli Bus Terminal', city: 'Hubballi' },
      { name: 'Gokarna Bus Stand', city: 'Gokarna' },
      { name: 'Goa Beach Stop', city: 'Goa' }
    ]
  }).catch(e => console.warn('[Prisma Seed] BusStops seed skipped:', e.message))

  // 13. Seed TransportRoutes
  await prisma.transportRoutes.createMany({
    data: [
      { origin: 'Hyderabad', destination: 'Hubballi', mode: 'train', serviceNumber: '17003', operator: 'Express Train', duration: '8h 00m', price: 450, runsOn: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] },
      { origin: 'Hubballi', destination: 'Gokarna', mode: 'bus', serviceNumber: 'Bus-UBL-GKN', operator: 'KSRTC', duration: '3h 00m', price: 200, runsOn: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] }
    ]
  }).catch(e => console.warn('[Prisma Seed] TransportRoutes seed skipped:', e.message))

  console.log('[Prisma Seed] Seeding completed successfully.')
}

main()
  .catch((e) => {
    console.error('[Prisma Seed Error]:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
