const mongoose = require('mongoose')

const academyStudentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true,
  },
  organization: {
    type: String,
    default: '',
    trim: true,
  },
  enrolledAt: {
    type: Date,
    default: Date.now,
  },
  lastActiveAt: {
    type: Date,
    default: Date.now,
  },
  source: {
    type: String,
    default: 'web_academy',
  },
  certificateIssued: {
    type: Boolean,
    default: false,
  },
})

const AcademyStudent =
  mongoose.models.AcademyStudent || mongoose.model('AcademyStudent', academyStudentSchema)

module.exports = AcademyStudent
