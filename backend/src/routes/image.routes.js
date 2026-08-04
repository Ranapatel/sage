const { Router } = require('express')
const { ImageController } = require('../controllers/image.controller')

const router = Router()

/**
 * Multi-source Image Service
 * Mount: /api/v1/images  and  /api/images
 *
 * Keys stay server-side (GOOGLE_PLACES_API_KEY, UNSPLASH_ACCESS_KEY, PEXELS_API_KEY).
 * Clients only receive resolved HTTPS image URLs + size variants.
 */
router.get('/resolve', ImageController.resolveImage)
router.get('/search', ImageController.searchImages)
router.get('/', ImageController.resolveImage)

module.exports = router
module.exports.default = router