const { Router } = require('express')
const { authMiddleware } = require('../middleware/auth.middleware')
const { UserController } = require('../modules/users/user.controller')

const router = Router()

router.get('/profile', authMiddleware, UserController.getProfile)
router.patch('/profile', authMiddleware, UserController.updateProfile)

module.exports = router
module.exports.default = router