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

/**
 * Clerk Bearer Token Authentication Middleware
 *
 * Behavior contract (post-Phase-0 hardening):
 *   - All protected requests MUST present `Authorization: Bearer <token>`.
 *   - Tokens are verified against Clerk using `@clerk/backend`'s verifyToken().
 *   - On any verification failure: return 401. No fallbacks. No offline mode.
 *   - The authenticated `User` row is resolved from PostgreSQL via Prisma
 *     using the verified `clerkUserId`. If the user does not exist in the
 *     database, return 403.
 *   - We do NOT auto-provision users from the bearer token. Auto-provisioning
 *     is reserved for the verified Clerk webhook handler in
 *     `webhooks/clerk.webhook.ts`, which uses Svix signature verification.
 *     Auto-provisioning here would let an attacker who can present a
 *     *verified-by-Clerk* token (e.g. a test token, a leaked token, or a
 *     Clerk session they actually own) create a User row with attacker-
 *     controlled email/name in our database.
 */
export async function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
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
    // No secret in env = the server is misconfigured. Fail closed.
    console.error('[Clerk Auth] CLERK_SECRET_KEY is not configured')
    return res.status(500).json({
      success: false,
      message: 'Authentication is not configured on this server'
    })
  }

  let sessionClaims
  try {
    sessionClaims = await verifyToken(token, { secretKey })
  } catch (err: any) {
    // Verify failure. No fallback. No decode. No parse. Return 401.
    // The previous version of this file had a dev-fallback that base64-decoded
    // the JWT payload without signature verification — that was a complete
    // auth bypass and has been removed.
    console.warn(
      '[Clerk Auth] Token verification failed:',
      err && err.message ? err.message : 'unknown error'
    )
    return res.status(401).json({
      success: false,
      message: 'Access denied: Invalid or expired token'
    })
  }

  const clerkUserId = sessionClaims && (sessionClaims as any).sub
  if (!clerkUserId) {
    return res.status(401).json({
      success: false,
      message: 'Access denied: Invalid session claims'
    })
  }

  // Map Clerk user → PostgreSQL User. Do not auto-provision here.
  // The Clerk webhook (webhooks/clerk.webhook.ts) is the source of truth
  // for user creation, verified via Svix.
  let dbUser
  try {
    dbUser = await prisma.user.findUnique({ where: { clerkUserId } })
  } catch (dbErr: any) {
    console.error('[Clerk Auth] Database error during user lookup:', dbErr.message)
    return res.status(500).json({
      success: false,
      message: 'Authentication backend unavailable'
    })
  }

  if (!dbUser) {
    return res.status(403).json({
      success: false,
      message:
        'Access denied: User is not synchronized with the database. ' +
        'Sign-up confirmation may still be processing — try again shortly.'
    })
  }

  req.user = {
    id: dbUser.id,
    clerkUserId: dbUser.clerkUserId,
    email: dbUser.email
  }

  return next()
}
