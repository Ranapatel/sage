import { prisma } from '../../prisma/prisma.client'

export class UserService {
  static async getProfile(clerkUserId: string) {
    return prisma.user.findUnique({
      where: { clerkUserId },
    })
  }

  static async updateProfile(clerkUserId: string, data: { firstName?: string; lastName?: string; profileImage?: string }) {
    return prisma.user.update({
      where: { clerkUserId },
      data,
    })
  }
}
