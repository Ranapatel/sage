import { prisma } from '../../prisma/prisma.client'

const memoryStore = new Map<string, any[]>()

export class ProfileService {
  static async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        travelPreference: true,
        wallet: true,
      }
    })

    if (!user) {
      throw new Error('User not found')
    }

    const stats = await this.getStats(userId)

    return {
      user: {
        id: user.id,
        clerkUserId: user.clerkUserId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImage: user.profileImage,
        createdAt: user.createdAt,
      },
      personal: user.profile,
      preferences: user.travelPreference,
      stats
    }
  }

  static async updateProfile(userId: string, clerkUserId: string, data: any) {
    return prisma.userProfile.upsert({
      where: { userId },
      update: data,
      create: {
        userId,
        clerkUserId,
        ...data
      }
    })
  }

  static async getPreferences(userId: string) {
    return prisma.travelPreference.findUnique({
      where: { userId }
    })
  }

  static async updatePreferences(userId: string, data: any) {
    return prisma.travelPreference.upsert({
      where: { userId },
      update: data,
      create: {
        userId,
        ...data
      }
    })
  }

  static async getStats(userId: string) {
    const tripsCount = await prisma.trip.count({
      where: { userId }
    })

    const trips = await prisma.trip.findMany({
      where: { userId },
      select: { destination: true }
    })

    // Count unique countries by split/comma or parsing destination name
    const countries = new Set(
      trips.map((t) => t.destination.split(',').pop()?.trim()).filter(Boolean)
    )
    const countriesVisited = countries.size

    const memoriesUploaded = await prisma.memory.count({
      where: { userId }
    })

    const wallet = await prisma.wallet.findUnique({
      where: { userId }
    })
    const walletBalance = wallet?.balance ?? 0

    return {
      tripsCreated: tripsCount,
      countriesVisited,
      memoriesUploaded,
      walletBalance
    }
  }

  // Saved items methods
  static async getSavedItems(userId: string) {
    try {
      return await prisma.savedItem.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' }
      })
    } catch (err: any) {
      console.warn('[ProfileService] SavedItem query failed:', err?.message)
      return []
    }
  }

  static async addSavedItem(userId: string, data: any) {
    // Check if it already exists
    const existing = await prisma.savedItem.findFirst({
      where: {
        userId,
        type: data.type,
        referenceId: data.referenceId
      }
    })
    if (existing) return existing

    return prisma.savedItem.create({
      data: {
        userId,
        type: data.type,
        referenceId: data.referenceId
      }
    })
  }

  static async removeSavedItem(id: string, userId: string) {
    // Verify ownership
    const item = await prisma.savedItem.findUnique({
      where: { id }
    })
    if (!item || item.userId !== userId) {
      throw new Error('Not authorized to delete this item')
    }

    return prisma.savedItem.delete({
      where: { id }
    })
  }

  // Memories methods
  static async getMemories(userId: string) {
    try {
      const dbMemories = await prisma.memory.findMany({
        where: { userId },
        include: { trip: true },
        orderBy: { createdAt: 'desc' }
      })
      const cached = memoryStore.get(userId) || []
      const combinedMap = new Map()
      cached.forEach(m => combinedMap.set(m.id, m))
      dbMemories.forEach(m => combinedMap.set(m.id, m))
      return Array.from(combinedMap.values()).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    } catch (dbErr: any) {
      console.warn('[ProfileService] DB notice during getMemories, returning cached memories:', dbErr.message)
      return (memoryStore.get(userId) || []).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    }
  }

  static async createMemory(userId: string, data: any) {
    let memory
    try {
      memory = await prisma.memory.create({
        data: {
          userId,
          ...data
        }
      })
    } catch (dbErr: any) {
      console.warn('[ProfileService] DB notice during createMemory, storing in fallback cache:', dbErr.message)
      memory = {
        id: `mem_${Date.now()}`,
        userId,
        title: data.title,
        description: data.description || null,
        location: data.location || null,
        photos: data.photos || [],
        createdAt: new Date().toISOString(),
        trip: null,
      }
    }

    const existing = memoryStore.get(userId) || []
    memoryStore.set(userId, [memory, ...existing])
    return memory
  }

  static async deleteMemory(id: string, userId: string) {
    try {
      await prisma.memory.delete({
        where: { id }
      })
    } catch (dbErr: any) {
      console.warn('[ProfileService] DB notice during deleteMemory:', dbErr.message)
    }

    const existing = memoryStore.get(userId) || []
    memoryStore.set(userId, existing.filter(m => m.id !== id))
  }

  // Wallet methods
  static async getWallet(userId: string) {
    let wallet = await prisma.wallet.findUnique({
      where: { userId }
    })
    
    // Create wallet if it doesn't exist yet
    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: { userId, balance: 500.0 } // give some initial welcome points!
      })
      // log transaction
      await prisma.walletTransaction.create({
        data: {
          userId,
          amount: 500.0,
          type: 'credit',
          reason: 'Welcome Sage Points Reward'
        }
      })
    }

    const transactions = await prisma.walletTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    })

    return {
      balance: wallet.balance,
      transactions
    }
  }

  static async createWalletTransaction(userId: string, data: any) {
    let wallet = await prisma.wallet.findUnique({
      where: { userId }
    })

    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: { userId, balance: 0.0 }
      })
    }

    const newBalance = data.type === 'credit'
      ? wallet.balance + data.amount
      : wallet.balance - data.amount

    if (newBalance < 0) {
      throw new Error('Insufficient wallet balance')
    }

    const [transaction] = await prisma.$transaction([
      prisma.walletTransaction.create({
        data: {
          userId,
          amount: data.amount,
          type: data.type,
          reason: data.reason
        }
      }),
      prisma.wallet.update({
        where: { userId },
        data: { balance: newBalance }
      })
    ])

    return transaction
  }

  // Referrals methods
  static async getReferrals(userId: string) {
    const referrals = await prisma.referral.findMany({
      where: { referrerId: userId },
      include: { referredUser: true },
      orderBy: { id: 'desc' }
    })
    return referrals
  }

  static async createReferral(userId: string, data: any) {
    // Check if target email belongs to a user
    const targetUser = await prisma.user.findFirst({
      where: { email: data.referredEmail }
    })

    if (!targetUser) {
      throw new Error('Referred user must be registered on TripSage to claim referral points.')
    }

    if (targetUser.id === userId) {
      throw new Error('You cannot refer yourself.')
    }

    // Check if already referred
    const existing = await prisma.referral.findUnique({
      where: { referredUserId: targetUser.id }
    })
    if (existing) {
      throw new Error('This user has already been referred.')
    }

    // Create completed referral and credit points!
    const [referral] = await prisma.$transaction([
      prisma.referral.create({
        data: {
          referrerId: userId,
          referredUserId: targetUser.id,
          status: 'completed',
          reward: data.reward || 100.0
        }
      }),
      // Credit referrer
      prisma.wallet.upsert({
        where: { userId },
        update: { balance: { increment: data.reward || 100.0 } },
        create: { userId, balance: data.reward || 100.0 }
      }),
      prisma.walletTransaction.create({
        data: {
          userId,
          amount: data.reward || 100.0,
          type: 'credit',
          reason: `Referral Reward for referring ${targetUser.email}`
        }
      }),
      // Credit referred user
      prisma.wallet.upsert({
        where: { userId: targetUser.id },
        update: { balance: { increment: 50.0 } },
        create: { userId: targetUser.id, balance: 50.0 }
      }),
      prisma.walletTransaction.create({
        data: {
          userId: targetUser.id,
          amount: 50.0,
          type: 'credit',
          reason: `Referral Signup Bonus from referrer`
        }
      })
    ])

    return referral
  }
}
