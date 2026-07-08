// Placeholder authMiddleware for Phase 1 clean foundation
// This will be replaced by the Clerk verification middleware in the next phase.

function authMiddleware(req, res, next) {
  // Attach a mock/demo user to the request for compatibility
  req.user = {
    id: "demo-user-id",
    email: "demo@tripsage.in",
    name: "Demo User"
  }
  next()
}

module.exports = { authMiddleware }
