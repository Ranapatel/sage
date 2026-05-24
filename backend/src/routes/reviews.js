const express = require('express')
const router = express.Router()
const { Review, memReviews, isMongoConnected } = require('../models/Review')

// GET /api/reviews
router.get('/', async (req, res) => {
  try {
    let reviews = []
    if (isMongoConnected()) {
      reviews = await Review.find().sort({ createdAt: -1 })
    } else {
      reviews = await memReviews.getAll()
    }
    res.json({ success: true, data: reviews })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// POST /api/reviews
router.post('/', async (req, res) => {
  try {
    const { name, location, rating, reviewText } = req.body
    if (!name || !location || !rating || !reviewText) {
      return res.status(400).json({ success: false, error: 'All fields are required' })
    }
    let newReview
    if (isMongoConnected()) {
      newReview = await Review.create({ name, location, rating, reviewText })
    } else {
      newReview = await memReviews.create({ name, location, rating, reviewText })
    }
    res.status(201).json({ success: true, data: newReview })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

module.exports = router
