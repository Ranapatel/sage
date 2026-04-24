const jwt = require('jsonwebtoken')
const JWT_SECRET = process.env.JWT_SECRET || 'tripsage_dev_secret_change_in_production'

function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET)
}

function authMiddleware(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return res.status(401).json({ success: false, message: 'No token provided' })
  try {
    req.user = verifyToken(token)
    next()
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' })
  }
}

module.exports = { signToken, verifyToken, authMiddleware }
