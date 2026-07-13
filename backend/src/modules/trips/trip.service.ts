import { prisma } from '../../prisma/prisma.client'

export class TripService {
  static async getUserTrips(userId: string) {
    return prisma.trip.findMany({
      where: { userId },
      include: {
        itineraryDays: {
          include: {
            activities: true,
          },
          orderBy: {
            dayNumber: 'asc'
          }
        },
        itineraryPlaces: {
          orderBy: {
            orderIndex: 'asc'
          }
        },
        travelPhotos: true,
      },
      orderBy: {
        startDate: 'desc'
      }
    })
  }

  static async createTrip(userId: string, data: {
    destination: string
    title: string
    startDate: string
    endDate: string
    budget: number
    travelers: number
    status: string
    itineraryDays?: {
      dayNumber: number
      title: string
      description?: string
      activities?: {
        name: string
        description?: string
        location?: string
        startTime?: string
        endTime?: string
        category?: string
      }[]
    }[]
    itineraryPlaces?: {
      dayNumber: number
      name: string
      category?: string
      latitude: number
      longitude: number
      visitTime?: string
      duration?: string
      orderIndex: number
    }[]
    travelPhotos?: {
      imageUrl: string
      caption?: string
    }[]
  }) {
    return prisma.trip.create({
      data: {
        userId,
        destination: data.destination,
        title: data.title,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        budget: data.budget,
        travelers: data.travelers,
        status: data.status,
        itineraryDays: data.itineraryDays ? {
          create: data.itineraryDays.map(day => ({
            dayNumber: day.dayNumber,
            title: day.title,
            description: day.description,
            activities: day.activities ? {
              create: day.activities.map(act => ({
                name: act.name,
                description: act.description,
                location: act.location,
                startTime: act.startTime ? new Date(act.startTime) : null,
                endTime: act.endTime ? new Date(act.endTime) : null,
                category: act.category,
              })),
            } : undefined,
          })),
        } : undefined,
        itineraryPlaces: data.itineraryPlaces ? {
          create: data.itineraryPlaces.map(place => ({
            dayNumber: place.dayNumber,
            name: place.name,
            category: place.category,
            latitude: place.latitude,
            longitude: place.longitude,
            visitTime: place.visitTime,
            duration: place.duration,
            orderIndex: place.orderIndex,
          })),
        } : undefined,
        travelPhotos: data.travelPhotos ? {
          create: data.travelPhotos.map(photo => ({
            userId,
            originalUrl: photo.imageUrl,
            imageUrl: photo.imageUrl,
            caption: photo.caption,
          })),
        } : undefined,
      },
      include: {
        itineraryDays: {
          include: {
            activities: true,
          },
        },
        itineraryPlaces: true,
        travelPhotos: true,
      },
    })
  }
}
