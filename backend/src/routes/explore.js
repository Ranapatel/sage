const express = require('express')
const router = express.Router()
const { param, query } = require('express-validator')
const { getRecommendations } = require('../services/aiService')

const MOCK_ACTIVITIES = (destination) => [
  { id: 'a1', name: `${destination} Sunrise Tour`, category: 'nature', price: 35, rating: 4.8, image: 'https://images.unsplash.com/photo-1527856263669-12c3a0af2aa6?w=400&q=80', duration: '4 hours' },
  { id: 'a2', name: 'Cultural Heritage Walk', category: 'culture', price: 20, rating: 4.6, image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80', duration: '3 hours' },
  { id: 'a3', name: 'Local Cooking Class', category: 'food', price: 45, rating: 4.9, image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=400&q=80', duration: '4 hours' },
  { id: 'a4', name: 'Adventure Sports Day', category: 'adventure', price: 65, rating: 4.7, image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&q=80', duration: '6 hours' },
  { id: 'a5', name: 'Sunset Boat Cruise', category: 'water', price: 55, rating: 4.8, image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=80', duration: '3 hours' },
]

const MOCK_RESTAURANTS = (destination) => [
  { id: 'r1', name: `${destination} Spice Garden`, cuisine: 'Local', priceRange: '$', price: 15, rating: 4.8, image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=80' },
  { id: 'r2', name: 'The Rooftop Bistro', cuisine: 'International', priceRange: '$$$', price: 45, rating: 4.6, image: 'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=400&q=80' },
  { id: 'r3', name: 'Night Market Eats', cuisine: 'Street Food', priceRange: '$', price: 8, rating: 4.5, image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80' },
]

// GET /api/explore/activities/:destination
router.get('/activities/:destination', [
  param('destination').trim().notEmpty().isLength({ max: 100 }).escape(),
  query('category').optional().isAlpha(),
], async (req, res) => {
  const dest = decodeURIComponent(req.params.destination)
  const { category } = req.query

  try {
    let activities = MOCK_ACTIVITIES(dest)
    if (category) {
      activities = activities.filter(a => a.category === category.toLowerCase())
    }
    res.json({
      success: true,
      data: { activities, total: activities.length },
      meta: { timestamp: new Date().toISOString(), source: 'mock' }
    })
  } catch (err) {
    res.status(500).json({ success: false, error: 'Activities service error' })
  }
})

// GET /api/explore/restaurants/:destination
router.get('/restaurants/:destination', [
  param('destination').trim().notEmpty().isLength({ max: 100 }).escape(),
], async (req, res) => {
  const dest = decodeURIComponent(req.params.destination)
  const restaurants = MOCK_RESTAURANTS(dest)
  res.json({
    success: true,
    data: { restaurants, total: restaurants.length },
    meta: { timestamp: new Date().toISOString(), source: 'mock' }
  })
})

module.exports = router
