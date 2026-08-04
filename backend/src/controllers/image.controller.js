const { ImageService } = require('../services/image/image.service')
const VALID_CATEGORIES = [
  'destinations',
  'hotels',
  'restaurants',
  'attractions',
  'cars',
  'hero',
  'activities',
]

function parseCategory(raw) {
  const value = String(raw || 'destinations').toLowerCase().trim()
  // Aliases
  const aliases = {
    destination: 'destinations',
    hotel: 'hotels',
    restaurant: 'restaurants',
    cafe: 'restaurants',
    'café': 'restaurants',
    attraction: 'attractions',
    landmark: 'attractions',
    museum: 'attractions',
    park: 'attractions',
    car: 'cars',
    rental: 'cars',
    'rental-car': 'cars',
    'rental_cars': 'cars',
    activity: 'activities',
    banner: 'hero',
  }
  if (aliases[value]) return aliases[value]
  if (VALID_CATEGORIES.includes(value)) return value
  return 'destinations'
}

class ImageController {
  /**
   * Resolves the single highest-scoring image for a query & category.
   * GET /api/v1/images/resolve?query=Paris&category=destinations
   * Optional: placeId, hotelbedsPhotoUrl, city, country
   */
  static async resolveImage(req, res) {
    try {
      const query =
        (req.query.query) ||
        (req.query.q) ||
        (req.query.name) ||
        'travel destination'
      const category = parseCategory(req.query.category || req.query.type)
      const hotelbedsPhotoUrl = (req.query.hotelbedsPhotoUrl) || undefined
      const placeId = (req.query.placeId) || undefined
      const city = (req.query.city) || undefined
      const country = (req.query.country) || undefined

      const imageResult = await ImageService.resolveImage(query, category, {
        hotelbedsPhotoUrl,
        placeId,
        city,
        country,
      })

      // Never return empty URL
      if (!imageResult.url) {
        res.json({
          success: true,
          data: {
            ...imageResult,
            url: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1600&q=80&auto=format&fit=crop',
            provider: 'placeholder',
          },
        })
        return
      }

      res.json({
        success: true,
        data: imageResult,
      })
    } catch (err) {
      console.error('[ImageController] Error resolving image:', err.message)
      // Soft-fail with placeholder — never break the client with empty images
      res.status(200).json({
        success: true,
        data: {
          url: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1600&q=80&auto=format&fit=crop',
          provider: 'placeholder',
          score: 40,
          category: 'destinations',
          query: String(req.query.query || ''),
          normalizedQuery: 'travel destination',
          variants: {
            hero: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1920&q=80&auto=format&fit=crop',
            card: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80&auto=format&fit=crop',
            mobile: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=640&q=80&auto=format&fit=crop',
            thumb: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&q=80&auto=format&fit=crop',
          },
        },
        warning: err.message,
      })
    }
  }

  /**
   * Searches and ranks multiple image candidates.
   * GET /api/v1/images/search?query=Paris&category=destinations&count=5
   */
  static async searchImages(req, res) {
    try {
      const query =
        (req.query.query) ||
        (req.query.q) ||
        (req.query.name) ||
        'travel destination'
      const category = parseCategory(req.query.category || req.query.type)
      const count = Math.min(parseInt(String(req.query.count || '5'), 10) || 5, 12)
      const placeId = (req.query.placeId) || undefined
      const city = (req.query.city) || undefined
      const country = (req.query.country) || undefined
      const hotelbedsPhotoUrl = (req.query.hotelbedsPhotoUrl) || undefined

      const results = await ImageService.searchImages(query, category, {
        count,
        placeId,
        city,
        country,
        hotelbedsPhotoUrl,
      })

      res.json({
        success: true,
        query,
        category,
        count: results.length,
        results,
      })
    } catch (err) {
      console.error('[ImageController] Error searching images:', err.message)
      res.status(200).json({
        success: true,
        query: String(req.query.query || ''),
        category: String(req.query.category || 'destinations'),
        count: 1,
        results: [
          {
            url: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1600&q=80&auto=format&fit=crop',
            provider: 'placeholder',
            score: 40,
            variants: {
              hero: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1920&q=80&auto=format&fit=crop',
              card: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80&auto=format&fit=crop',
              mobile: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=640&q=80&auto=format&fit=crop',
              thumb: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&q=80&auto=format&fit=crop',
            },
          },
        ],
        warning: err.message,
      })
    }
  }
}

module.exports = { ImageController }
module.exports.ImageController = ImageController
module.exports.parseCategory = parseCategory
