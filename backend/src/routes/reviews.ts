import { Request, Response, Router } from 'express'
import { prisma } from '../prisma/prisma.client'

const router = Router()

// GET /api/reviews
router.get('/', async (req: Request, res: Response) => {
  try {
    const reviews = await (prisma as any).review.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    })
    return res.json({ success: true, data: reviews })
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || 'Internal server error' })
  }
})

// POST /api/reviews
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, location, rating, reviewText, userId } = req.body
    if (!name || !location || !rating || !reviewText) {
      return res.status(400).json({ success: false, error: 'All fields are required' })
    }

    const newReview = await (prisma as any).review.create({
      data: {
        name: String(name),
        location: String(location),
        rating: Number(rating),
        reviewText: String(reviewText),
        userId: userId ? String(userId) : null,
      },
    })
    return res.status(201).json({ success: true, data: newReview })
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || 'Internal server error' })
  }
})

export default router
