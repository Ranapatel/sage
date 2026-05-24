const mongoose = require('mongoose')

const reviewSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  reviewText: { type: String, required: true },
}, { timestamps: true })

let Review
try {
  Review = mongoose.model('Review')
} catch {
  Review = mongoose.model('Review', reviewSchema)
}

// In-memory fallback array for reviews
const memoryReviews = []

const memReviews = {
  async getAll() {
    return memoryReviews
  },
  async create(data) {
    const review = {
      _id: Math.random().toString(36).slice(2) + Date.now().toString(36),
      name: data.name,
      location: data.location,
      rating: data.rating,
      reviewText: data.reviewText,
      createdAt: new Date().toISOString(),
    }
    memoryReviews.push(review)
    return review
  }
}

const isMongoConnected = () => mongoose.connection.readyState === 1

module.exports = { Review, memReviews, isMongoConnected }
