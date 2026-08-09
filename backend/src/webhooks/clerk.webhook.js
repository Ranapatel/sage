const { Webhook } = require('svix')
const { prisma } = require('../prisma/prisma.client')

async function handleClerkWebhook(req, res) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    console.error('CLERK_WEBHOOK_SECRET is not set')
    return res.status(500).json({
      success: false,
      message: 'Webhook secret is not configured in backend environment'
    })
  }

  // Retrieve Svix verification headers
  const svix_id = req.headers['svix-id']
  const svix_timestamp = req.headers['svix-timestamp']
  const svix_signature = req.headers['svix-signature']

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return res.status(400).json({
      success: false,
      message: 'Missing required Svix validation headers'
    })
  }

  // Get raw body for verification (assigned via express.json verify middleware)
  const payload = req.rawBody || JSON.stringify(req.body)
  const headers = {
    'svix-id': svix_id,
    'svix-timestamp': svix_timestamp,
    'svix-signature': svix_signature,
  }

  const wh = new Webhook(WEBHOOK_SECRET)

  let evt
  try {
    evt = wh.verify(payload, headers)
  } catch (err) {
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
      // Read the referral code stored in Clerk unsafeMetadata by the sign-up page
      const referredByClerkId = data.unsafe_metadata?.referredBy || null

      // ── Create the new user in DB ──────────────────────────────────────────
      const newUser = await prisma.user.create({
        data: {
          clerkUserId,
          email,
          firstName,
          lastName,
          profileImage,
        }
      })
      console.log(`[Clerk Webhook] Synchronized new user: ${newUser.id}`)

      // ── Give 100 Welcome Credits to EVERY new user (with or without referral) ─
      await prisma.$transaction([
        prisma.wallet.create({
          data: { userId: newUser.id, balance: 100.0 }
        }),
        prisma.walletTransaction.create({
          data: {
            userId: newUser.id,
            amount: 100.0,
            type: 'credit',
            reason: 'Welcome to TripSage! 🎉 Enjoy 100 Free Sage Credits to get started.'
          }
        })
      ])
      console.log(`[Clerk Webhook] ✅ 100 welcome credits given to new user: ${newUser.id}`)

      // ── Auto-apply referral reward if ?ref= was present on sign-up ────────
      if (referredByClerkId && referredByClerkId !== clerkUserId) {
        try {
          // Find the referrer by their Clerk userId
          const referrer = await prisma.user.findUnique({
            where: { clerkUserId: referredByClerkId }
          })

          if (referrer) {
            // Guard: don't double-credit if this user was already referred
            const existingReferral = await prisma.referral.findUnique({
              where: { referredUserId: newUser.id }
            })

            if (!existingReferral) {
              // Atomic transaction: create referral + credit both wallets
              await prisma.$transaction([
                // Referral record
                prisma.referral.create({
                  data: {
                    referrerId: referrer.id,
                    referredUserId: newUser.id,
                    status: 'completed',
                    reward: 200.0,
                  }
                }),
                // Credit referrer +200
                prisma.wallet.upsert({
                  where: { userId: referrer.id },
                  update: { balance: { increment: 200.0 } },
                  create: { userId: referrer.id, balance: 200.0 }
                }),
                prisma.walletTransaction.create({
                  data: {
                    userId: referrer.id,
                    amount: 200.0,
                    type: 'credit',
                    reason: `Referral Reward — ${email} signed up with your link`
                  }
                }),
                // Credit new user +100 referral bonus (wallet already exists with 100 welcome credits)
                prisma.wallet.update({
                  where: { userId: newUser.id },
                  data: { balance: { increment: 100.0 } }
                }),
                prisma.walletTransaction.create({
                  data: {
                    userId: newUser.id,
                    amount: 100.0,
                    type: 'credit',
                    reason: 'Referral Signup Bonus — you joined via a friend\'s invite!'
                  }
                }),
              ])

              console.log(`[Clerk Webhook] ✅ Referral auto-credited: referrer=${referrer.id} (+200) → new user=${newUser.id} (+100)`)
            } else {
              console.log(`[Clerk Webhook] Referral already exists for user ${newUser.id}, skipping.`)
            }
          } else {
            console.warn(`[Clerk Webhook] Referrer with clerkUserId=${referredByClerkId} not found in DB.`)
          }
        } catch (refErr) {
          // Log but don't fail the webhook — user creation must always succeed
          console.error('[Clerk Webhook] Referral credit failed (non-fatal):', refErr.message)
        }
      }

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
  } catch (err) {
    console.error('[Clerk Webhook Syncer DB Error]:', err.message)
    return res.status(500).json({
      success: false,
      message: 'Database error processing user sync webhook'
    })
  }
}

module.exports = { handleClerkWebhook }
module.exports.handleClerkWebhook = handleClerkWebhook