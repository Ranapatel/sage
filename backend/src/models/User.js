const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

// In-memory store for when MongoDB is unavailable
const memoryStore = new Map()

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  currency: { type: String, default: 'INR', enum: ['INR', 'USD', 'EUR', 'GBP', 'AED'] },
  country: { type: String, default: 'India' },
  preferences: { type: Object, default: {} },
  trips: [{ type: String }],
}, { timestamps: true })

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  this.password = await bcrypt.hash(this.password, 12)
  next()
})

userSchema.methods.comparePassword = async function (plain) {
  return bcrypt.compare(plain, this.password)
}

userSchema.methods.toSafe = function () {
  const obj = this.toObject()
  delete obj.password
  return obj
}

let User
try {
  User = mongoose.model('User')
} catch {
  User = mongoose.model('User', userSchema)
}

// ── Memory-store helpers (fallback when MongoDB is down) ──────────────────────
const memUsers = {
  async findByEmail(email) {
    for (const u of memoryStore.values()) if (u.email === email) return u
    return null
  },
  async findById(id) {
    return memoryStore.get(id) || null
  },
  async create(data) {
    const id = Math.random().toString(36).slice(2) + Date.now().toString(36)
    const hashed = await bcrypt.hash(data.password, 12)
    const user = {
      _id: id, id,
      name: data.name,
      email: data.email.toLowerCase(),
      password: hashed,
      currency: data.currency || 'INR',
      country: data.country || 'India',
      preferences: {},
      trips: [],
      createdAt: new Date().toISOString(),
    }
    memoryStore.set(id, user)
    return user
  },
  safe(user) {
    const { password, ...safe } = user
    return safe
  },
  async comparePassword(plain, hashed) {
    return bcrypt.compare(plain, hashed)
  },
}

const isMongoConnected = () => mongoose.connection.readyState === 1

module.exports = { User, memUsers, isMongoConnected }
