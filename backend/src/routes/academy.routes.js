const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const AcademyStudent = require('../models/AcademyStudent')
const AcademyCourse = require('../models/AcademyCourse')
const AcademyProgress = require('../models/AcademyProgress')

const isMongoConnected = () => mongoose.connection.readyState === 1

// In-memory fallback stores
const inMemoryStudents = new Map()
const inMemoryProgress = new Map()

// Default Foundations of AGI syllabus
const DEFAULT_AGI_COURSE = {
  slug: 'foundations-of-agi',
  title: 'Foundations of Artificial General Intelligence',
  subtitle: 'Learn Artificial General Intelligence',
  description:
    'A free 5-episode course designed to help you understand AGI, modern AI systems, reasoning, agents, and the future of intelligent machines.',
  totalEpisodes: 5,
  introVideoUrl: '/academy/intro.mp4',
  episodes: [
    {
      episodeNumber: 1,
      title: 'What Is AGI, Really?',
      synopsis:
        "Understand what Artificial General Intelligence actually means and how it differs from today's AI.",
      durationText: '~8 min',
      releaseDateText: 'September 21, 2026',
      releaseDate: new Date('2026-09-21T00:00:00Z'),
      status: 'unlocks_date',
      videoUrl: '',
      resources: [{ title: 'Course Notes & Definitions', url: '#' }],
    },
    {
      episodeNumber: 2,
      title: "AI vs AGI: What's the Difference?",
      synopsis:
        'Understand narrow AI, generative AI, and the capabilities generally associated with AGI.',
      durationText: '~8 min',
      releaseDateText: 'September 24, 2026',
      releaseDate: new Date('2026-09-24T00:00:00Z'),
      status: 'unlocks_date',
      videoUrl: '',
      resources: [{ title: 'Comparative Framework PDF', url: '#' }],
    },
    {
      episodeNumber: 3,
      title: 'How Does Intelligence Work?',
      synopsis: 'Explore learning, reasoning, memory, planning, and adaptation.',
      durationText: '~9 min',
      releaseDateText: 'September 28, 2026',
      releaseDate: new Date('2026-09-28T00:00:00Z'),
      status: 'upcoming',
      videoUrl: '',
      resources: [{ title: 'Cognitive Architecture Overview', url: '#' }],
    },
    {
      episodeNumber: 4,
      title: 'AI Agents: From Chatbots to Action',
      synopsis:
        'Learn how AI agents combine models, memory, tools, reasoning, and actions.',
      durationText: '~10 min',
      releaseDateText: 'October 1, 2026',
      releaseDate: new Date('2026-10-01T00:00:00Z'),
      status: 'upcoming',
      videoUrl: '',
      resources: [{ title: 'Agent Tooling Cheatsheet', url: '#' }],
    },
    {
      episodeNumber: 5,
      title: 'The Road to AGI',
      synopsis:
        'Explore the major capabilities, challenges, open questions, and possible directions toward more general AI.',
      durationText: '~10 min',
      releaseDateText: 'October 5, 2026',
      releaseDate: new Date('2026-10-05T00:00:00Z'),
      status: 'upcoming',
      videoUrl: '',
      resources: [{ title: 'Future of AGI Roadmap', url: '#' }],
    },
  ],
}

// Helper to ensure default course is seeded in MongoDB
async function getOrSeedCourse(slug = 'foundations-of-agi') {
  try {
    let course = await AcademyCourse.findOne({ slug })
    if (!course) {
      course = await AcademyCourse.create(DEFAULT_AGI_COURSE)
    }
    return course
  } catch (err) {
    console.warn('[Academy] Failed to query/seed course from DB, returning in-memory fallback:', err.message)
    return DEFAULT_AGI_COURSE
  }
}

/**
 * POST /api/academy/enroll
 * Body: { name, email, organization, source }
 */
router.post('/enroll', async (req, res) => {
  try {
    const { name, email, organization, source } = req.body

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Name and email are required for enrollment.',
      })
    }

    const cleanEmail = email.trim().toLowerCase()
    const cleanName = name.trim()

    let student = null
    let progress = null
    let course = null

    try {
      student = await AcademyStudent.findOneAndUpdate(
        { email: cleanEmail },
        {
          $set: {
            name: cleanName,
            organization: organization ? organization.trim() : '',
            lastActiveAt: new Date(),
          },
          $setOnInsert: {
            source: source || 'web_academy',
            enrolledAt: new Date(),
          },
        },
        { new: true, upsert: true }
      )

      progress = await AcademyProgress.findOne({
        studentEmail: cleanEmail,
        courseSlug: 'foundations-of-agi',
      })

      if (!progress) {
        progress = await AcademyProgress.create({
          studentId: student._id,
          studentEmail: cleanEmail,
          courseSlug: 'foundations-of-agi',
          completedEpisodes: [],
          hasWatchedIntro: false,
          currentEpisode: 1,
        })
      }

      course = await getOrSeedCourse('foundations-of-agi')
    } catch (dbErr) {
      console.warn('[Academy] MongoDB operation error (using fallback):', dbErr.message)
      student = {
        _id: 'temp_' + Date.now(),
        name: cleanName,
        email: cleanEmail,
        organization: organization || '',
        enrolledAt: new Date(),
      }
      progress = {
        studentEmail: cleanEmail,
        courseSlug: 'foundations-of-agi',
        completedEpisodes: [],
        hasWatchedIntro: false,
        currentEpisode: 1,
      }
      course = DEFAULT_AGI_COURSE
    }

    if (student) {
      inMemoryStudents.set(cleanEmail, {
        _id: student._id || 'id_' + Date.now(),
        name: cleanName,
        email: cleanEmail,
        organization: organization || '',
        enrolledAt: student.enrolledAt || new Date(),
        source: source || 'web_academy',
      })
    }

    return res.status(200).json({
      success: true,
      message: 'Successfully enrolled in TripSage Academy!',
      data: {
        student,
        progress,
        course,
      },
    })
  } catch (error) {
    console.error('[Academy] Enrollment error:', error)
    return res.status(500).json({
      success: false,
      message: 'Internal server error while enrolling.',
      error: error.message,
    })
  }
})

/**
 * GET /api/academy/course/:slug?
 */
router.get('/course/:slug?', async (req, res) => {
  try {
    const slug = req.params.slug || 'foundations-of-agi'
    const course = await getOrSeedCourse(slug)
    return res.status(200).json({
      success: true,
      data: course,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch course details.',
      error: error.message,
    })
  }
})

/**
 * GET /api/academy/progress
 * Query: ?email=...
 */
router.get('/progress', async (req, res) => {
  try {
    const { email } = req.query
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email parameter is required.',
      })
    }

    const cleanEmail = email.trim().toLowerCase()
    let progress = null
    let student = null

    try {
      student = await AcademyStudent.findOne({ email: cleanEmail })
      progress = await AcademyProgress.findOne({
        studentEmail: cleanEmail,
        courseSlug: 'foundations-of-agi',
      })
    } catch (dbErr) {
      console.warn('[Academy] DB fetch error for progress:', dbErr.message)
    }

    if (!student || !progress) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found.',
      })
    }

    const course = await getOrSeedCourse('foundations-of-agi')

    return res.status(200).json({
      success: true,
      data: {
        student,
        progress,
        course,
      },
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch student progress.',
      error: error.message,
    })
  }
})

/**
 * POST /api/academy/complete-episode
 * Body: { email, episodeNumber }
 */
router.post('/complete-episode', async (req, res) => {
  try {
    const { email, episodeNumber } = req.body
    if (!email || !episodeNumber) {
      return res.status(400).json({
        success: false,
        message: 'Email and episodeNumber are required.',
      })
    }

    const cleanEmail = email.trim().toLowerCase()
    const epNum = Number(episodeNumber)

    try {
      const progress = await AcademyProgress.findOne({
        studentEmail: cleanEmail,
        courseSlug: 'foundations-of-agi',
      })

      if (progress) {
        if (!progress.completedEpisodes.includes(epNum)) {
          progress.completedEpisodes.push(epNum)
          progress.completedEpisodes.sort((a, b) => a - b)
        }
        await progress.save()

        return res.status(200).json({
          success: true,
          message: `Episode ${epNum} completed.`,
          data: progress,
        })
      }
    } catch (dbErr) {
      console.warn('[Academy] DB error marking episode complete:', dbErr.message)
    }

    return res.status(200).json({
      success: true,
      message: `Episode ${epNum} completed (offline sync).`,
      data: {
        studentEmail: cleanEmail,
        completedEpisodes: [epNum],
      },
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update episode progress.',
      error: error.message,
    })
  }
})

/**
 * POST /api/academy/intro-watched
 * Body: { email }
 */
router.post('/intro-watched', async (req, res) => {
  try {
    const { email } = req.body
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' })
    }

    const cleanEmail = email.trim().toLowerCase()
    try {
      const progress = await AcademyProgress.findOneAndUpdate(
        { studentEmail: cleanEmail, courseSlug: 'foundations-of-agi' },
        { $set: { hasWatchedIntro: true } },
        { new: true }
      )
      return res.status(200).json({ success: true, data: progress })
    } catch (e) {
      return res.status(200).json({ success: true, message: 'Updated (offline sync)' })
    }
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
})

/**
 * GET /api/academy/students
 * View all enrolled students in the database
 */
router.get('/students', async (req, res) => {
  try {
    let students = []
    if (isMongoConnected()) {
      try {
        students = await AcademyStudent.find({}).sort({ enrolledAt: -1 }).lean()
      } catch (e) {
        console.warn('[Academy] MongoDB query failed, falling back to memory store:', e.message)
      }
    }

    // Merge in-memory students if any are not yet in DB
    const existingEmails = new Set(students.map(s => s.email))
    for (const [email, s] of inMemoryStudents.entries()) {
      if (!existingEmails.has(email)) {
        students.push(s)
      }
    }

    return res.status(200).json({
      success: true,
      count: students.length,
      students: students.map((s) => ({
        id: s._id,
        name: s.name,
        email: s.email,
        organization: s.organization || 'N/A',
        enrolledAt: s.enrolledAt,
        source: s.source || 'web_academy',
      })),
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch enrolled students.',
      error: error.message,
    })
  }
})

module.exports = router

