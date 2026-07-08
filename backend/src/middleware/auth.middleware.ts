import { Request, Response, NextFunction } from 'express'
import { verifyToken } from '@clerk/backend'
import { prisma } from '../prisma/prisma.client'

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string
    clerkUserId: string
    email: string
  }
}

export async function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Access denied: No token provided'
    })
  }

  const token = authHeader.split(' ')[1]

  try {
    // Verify Bearer session token using Clerk's token verifier
    const sessionClaims = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY
    })
    
    const clerkUserId = sessionClaims.sub

    if (!clerkUserId) {
      return res.status(401).json({
        success: false,
        message: 'Access denied: Invalid session claims'
      })
    }

    // Map to synchronized PostgreSQL User record
    let dbUser = await prisma.user.findUnique({
      where: { clerkUserId }
    })

    if (!dbUser) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`[Clerk Auth Middleware] User ${clerkUserId} not found in database. Auto-provisioning local developer user record.`)
        // Access optional/standard fields from sessionClaims
        const email = (sessionClaims as any).email || (sessionClaims as any).email_address || 'developer@tripsage.in'
        const firstName = (sessionClaims as any).first_name || (sessionClaims as any).firstName || 'Developer'
        const lastName = (sessionClaims as any).last_name || (sessionClaims as any).lastName || 'Traveler'
        const profileImage = (sessionClaims as any).image_url || (sessionClaims as any).profile_image_url || null

        dbUser = await prisma.user.create({
          data: {
            clerkUserId,
            email,
            firstName,
            lastName,
            profileImage,
          }
        })
      } else {
        return res.status(403).json({
          success: false,
          message: 'Access denied: User is not synchronized with database'
        })
      }
    }

    // Attach user to req context
    req.user = {
      id: dbUser.id,
      clerkUserId: dbUser.clerkUserId,
      email: dbUser.email
    }

    next()
  } catch (err: any) {
    console.error('[Clerk Auth Middleware Error]:', err.message)

    // Offline development fallback when network/external calls are blocked
    if (process.env.NODE_ENV === 'development') {
      try {
        console.warn('[Clerk Auth Middleware] Network verification failed. Falling back to local JWT decode in development mode.')
        const parts = token.split('.')
        if (parts.length === 3) {
          const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'))
          const clerkUserId = payload.sub
          if (clerkUserId) {
            let dbUser = await prisma.user.findUnique({
              where: { clerkUserId }
            })
            if (!dbUser) {
              console.warn(`[Clerk Auth Middleware Fallback] Auto-provisioning local user record for offline JWT decode: ${clerkUserId}`)
              const email = payload.email || payload.email_address || 'developer@tripsage.in'
              const firstName = payload.first_name || payload.firstName || 'Developer'
              const lastName = payload.last_name || payload.lastName || 'Traveler'
              const profileImage = payload.image_url || payload.profile_image_url || null

              dbUser = await prisma.user.create({
                data: {
                  clerkUserId,
                  email,
                  firstName,
                  lastName,
                  profileImage,
                }
              })
            }
            if (dbUser) {
              req.user = {
                id: dbUser.id,
                clerkUserId: dbUser.clerkUserId,
                email: dbUser.email
              }
              return next()
            }
          }
        }
      } catch (fallbackErr: any) {
        console.error('[Clerk Auth Middleware Fallback Error]:', fallbackErr.message)
      }
    }

    return res.status(401).json({
      success: false,
      message: 'Access denied: Invalid or expired token'
    })
  }
}
