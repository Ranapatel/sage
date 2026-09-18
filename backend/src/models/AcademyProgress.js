const mongoose = require('mongoose')

const academyProgressSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AcademyStudent',
    required: true,
  },
  studentEmail: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    index: true,
  },
  courseSlug: {
    type: String,
    default: 'foundations-of-agi',
    index: true,
  },
  completedEpisodes: {
    type: [Number],
    default: [],
  },
  hasWatchedIntro: {
    type: Boolean,
    default: false,
  },
  currentEpisode: {
    type: Number,
    default: 1,
  },
  isCompleted: {
    type: Boolean,
    default: false,
  },
  completedAt: {
    type: Date,
    default: null,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
})

academyProgressSchema.pre('save', function (next) {
  this.updatedAt = new Date()
  if (this.completedEpisodes && this.completedEpisodes.length >= 5) {
    this.isCompleted = true
    if (!this.completedAt) this.completedAt = new Date()
  }
  next()
})

const AcademyProgress =
  mongoose.models.AcademyProgress || mongoose.model('AcademyProgress', academyProgressSchema)

module.exports = AcademyProgress
