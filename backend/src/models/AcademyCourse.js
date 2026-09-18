const mongoose = require('mongoose')

const episodeSchema = new mongoose.Schema({
  episodeNumber: { type: Number, required: true },
  title: { type: String, required: true },
  synopsis: { type: String, default: '' },
  durationText: { type: String, default: '~8 min' },
  releaseDateText: { type: String, default: 'September 21, 2026' },
  releaseDate: { type: Date, required: true },
  status: {
    type: String,
    enum: ['available', 'unlocks_date', 'upcoming'],
    default: 'upcoming',
  },
  videoUrl: { type: String, default: '' },
  resources: [
    {
      title: String,
      url: String,
    },
  ],
})

const academyCourseSchema = new mongoose.Schema({
  slug: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  title: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
    default: 'Learn Artificial General Intelligence',
  },
  description: {
    type: String,
    default:
      'A free 5-episode course designed to help you understand AGI, modern AI systems, reasoning, agents, and the future of intelligent machines.',
  },
  totalEpisodes: {
    type: Number,
    default: 5,
  },
  introVideoUrl: {
    type: String,
    default: '/academy/intro.mp4',
  },
  episodes: [episodeSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

const AcademyCourse =
  mongoose.models.AcademyCourse || mongoose.model('AcademyCourse', academyCourseSchema)

module.exports = AcademyCourse
