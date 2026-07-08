import { Request, Response } from 'express'
import { Webhook } from 'svix'
import { prisma } from '../prisma/prisma.client'

export async function handleClerkWebhook(req: Request, res: Response) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    console.error('CLERK_WEBHOOK_SECRET is not set')
    return res.status(500).json({
      success: false,
      message: 'Webhook secret is not configured in backend environment'
    })
  }

  // Retrieve Svix verification headers
  const svix_id = req.headers['svix-id'] as string
  const svix_timestamp = req.headers['svix-timestamp'] as string
  const svix_signature = req.headers['svix-signature'] as string

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return res.status(400).json({
      success: false,
      message: 'Missing required Svix validation headers'
    })
  }

  // Get raw body for verification (assigned via express.json verify middleware)
  const payload = (req as any).rawBody || JSON.stringify(req.body)
  const headers = {
    'svix-id': svix_id,
    'svix-timestamp': svix_timestamp,
    'svix-signature': svix_signature,
  }

  const wh = new Webhook(WEBHOOK_SECRET)

  let evt: any
  try {
    evt = wh.verify(payload, headers)
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return res.status(400).json({
      success: false,
      message: 'Signature verification failed'
    })
  }

  const { type, data } = evt

  try {
    if (type === 'user.created') {
      const email = data.email_addresses?.[0]?.email_address || ''
      const firstName = data.first_name || null
      const lastName = data.last_name || null
      const profileImage = data.image_url || null
      const clerkUserId = data.id

      const user = await prisma.user.create({
        data: {
          clerkUserId,
          email,
          firstName,
          lastName,
          profileImage,
        }
      })
      console.log(`[Clerk Webhook] Synchronized new user: ${user.id}`)
    } else if (type === 'user.updated') {
      const email = data.email_addresses?.[0]?.email_address || ''
      const firstName = data.first_name || null
      const lastName = data.last_name || null
      const profileImage = data.image_url || null
      const clerkUserId = data.id

      await prisma.user.update({
        where: { clerkUserId },
        data: {
          email,
          firstName,
          lastName,
          profileImage,
        }
      })
      console.log(`[Clerk Webhook] Updated user credentials: ${clerkUserId}`)
    } else if (type === 'user.deleted') {
      const clerkUserId = data.id

      await prisma.user.delete({
        where: { clerkUserId }
      })
      console.log(`[Clerk Webhook] Deleted user: ${clerkUserId}`)
    }

    return res.status(200).json({
      success: true,
      message: 'Clerk webhook sync completed successfully'
    })
  } catch (err: any) {
    console.error('[Clerk Webhook Syncer DB Error]:', err.message)
    return res.status(500).json({
      success: false,
      message: 'Database error processing user sync webhook'
    })
  }
}
