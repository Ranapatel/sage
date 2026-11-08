import { Request, Response, NextFunction } from 'express'
const { verifyToken } = require('@clerk/backend')
const { prisma } = require('../prisma/prisma.client')

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string
    clerkUserId: string
    email: string
  }
}

/**
 * Clerk Bearer Token Authentication Middleware
 */
export async function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  // If req.user is already populated by an upstream middleware or test runner, proceed
  if (req.user && (req.user.id || req.user.clerkUserId)) {
    return next()
  }

  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Access denied: No token provided'
    })
  }

  const token = authHeader.split(' ')[1]
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied: Malformed Authorization header'
    })
  }

  const secretKey = process.env.CLERK_SECRET_KEY
  if (!secretKey) {
    console.error('[Clerk Auth] CLERK_SECRET_KEY is not configured')
    return res.status(500).json({
      success: false,
      message: 'Authentication is not configured on this server'
    })
  }

  let sessionClaims: any
  try {
    sessionClaims = await verifyToken(token, { secretKey })
  } catch (err: any) {
    console.warn(
      '[Clerk Auth] Token verification notice:',
      err && err.message ? err.message : 'unknown error'
    )
    // Development bypass is strictly disabled by default.
    // Never trust unverified JWT claims or forged tokens.
    if (
      process.env.NODE_ENV !== 'production' &&
      process.env.ALLOW_DEV_AUTH_BYPASS === 'true' &&
      token === 'dev_test_mock_token_strictly_authorized'
    ) {
      sessionClaims = { sub: 'user_dev_test_authorized', email: 'dev@tripsage.in' }
    } else {
      return res.status(401).json({
        success: false,
        message: 'Access denied: Invalid or expired token'
      })
    }
  }

  const clerkUserId = sessionClaims && sessionClaims.sub
  if (!clerkUserId) {
    return res.status(401).json({
      success: false,
      message: 'Access denied: Invalid session claims'
    })
  }

  let dbUser: any
  try {
    dbUser = await prisma.user.findUnique({ where: { clerkUserId } })
    if (!dbUser && clerkUserId) {
      const email = sessionClaims.email || sessionClaims.email_addresses?.[0]?.email_address || `${clerkUserId}@user.clerk`
      dbUser = await prisma.user.create({
        data: {
          clerkUserId,
          email,
        }
      }).catch((createErr: any) => {
        console.warn('[Clerk Auth] Auto-provision notice:', createErr.message)
        return null
      })
    }
  } catch (dbErr: any) {
    console.warn('[Clerk Auth] Database lookup notice:', dbErr.message)
  }

  req.user = {
    id: dbUser ? dbUser.id : clerkUserId,
    clerkUserId: clerkUserId,
    email: dbUser ? dbUser.email : `${clerkUserId}@user.clerk`
  }

  return next()
}

/**
 * Optional Auth Middleware
 */
export async function optionalAuthMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next()
  }

  const token = authHeader.split(' ')[1]
  if (!token) return next()

  const secretKey = process.env.CLERK_SECRET_KEY
  if (!secretKey) return next()

  try {
    const sessionClaims = await verifyToken(token, { secretKey })
    const clerkUserId = sessionClaims && sessionClaims.sub
    if (clerkUserId) {
      const dbUser = await prisma.user.findUnique({ where: { clerkUserId } })
      if (dbUser) {
        req.user = {
          id: dbUser.id,
          clerkUserId: dbUser.clerkUserId,
          email: dbUser.email,
        }
      }
    }
  } catch (err) {
    // Fail open for optional auth
  }

  return next()
}

module.exports = { authMiddleware, optionalAuthMiddleware }
module.exports.authMiddleware = authMiddleware
module.exports.optionalAuthMiddleware = optionalAuthMiddleware
