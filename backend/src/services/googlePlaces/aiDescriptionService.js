/**
 * AI Description Service — Generates concise place descriptions
 * using Groq LLaMA when Google editorial summaries are unavailable.
 */

const axios = require('axios')
const { cacheGet, cacheSet, generateCacheKey } = require('../../../config/redis')

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'
const MODEL = 'llama-3.3-70b-versatile'

/**
 * Generate an AI-powered description for a place.
 *
 * @param {object} place - Place data from Google
 * @param {string} place.name
 * @param {string} place.address
 * @param {string} place.primaryType
 * @param {number} place.rating
 * @param {number} place.userRatingsTotal
 * @param {string[]} place.reviewSnippets - Short review excerpts
 * @returns {Promise<string>} AI-generated description (80-150 words)
 */
async function generatePlaceDescription(place) {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    console.warn('[AIDescription] GROQ_API_KEY not configured — returning generic description')
    return generateFallbackDescription(place)
  }

  // Check cache first
  const cacheKey = generateCacheKey('ai_desc', { id: place.name, addr: place.address })
  try {
    const cached = await cacheGet(cacheKey)
    if (cached) return cached
  } catch { /* Redis down = proceed */ }

  const reviewContext = (place.reviewSnippets || []).slice(0, 3).join(' | ')
  const ratingText = place.rating ? `${place.rating}/5 stars from ${place.userRatingsTotal || 0} reviews` : 'No rating data'

  const systemPrompt = `You are a professional travel writer for TripSage. Write a concise, engaging description of a place for tourists.

RULES:
- Write 80-150 words maximum
- Mention what makes the place special
- Include history if the place type suggests it (temples, monuments, museums)
- Explain why tourists visit
- Suggest best time to visit or recommended duration if appropriate
- Add one practical tip for visitors
- DO NOT invent specific facts, dates, or statistics you are unsure about
- If you lack information, write a general travel-style summary
- Write in a warm, inviting tone
- Return ONLY the description text, no headers or formatting`

  const userPrompt = `Write a travel description for:
Name: ${place.name}
Type: ${place.primaryType || 'attraction'}
Address: ${place.address}
Rating: ${ratingText}
${reviewContext ? `Visitor reviews: "${reviewContext}"` : ''}

Write a concise description (80-150 words).`

  try {
    const response = await axios.post(GROQ_API_URL, {
      model: MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 300,
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 8000
    })

    const text = response.data?.choices?.[0]?.message?.content?.trim()
    if (text) {
      // Cache for 7 days — descriptions don't change often
      try { await cacheSet(cacheKey, text, 604800) } catch { /* silent */ }
      return text
    }

    return generateFallbackDescription(place)
  } catch (err) {
    console.warn('[AIDescription] Groq API failed:', err.message)
    return generateFallbackDescription(place)
  }
}

/**
 * Generate a generic description when AI is unavailable.
 */
function generateFallbackDescription(place) {
  const name = place.name || 'This place'
  const type = (place.primaryType || 'destination').replace(/_/g, ' ')
  const rating = place.rating ? `Rated ${place.rating}/5 by visitors` : ''
  const reviews = place.userRatingsTotal ? `with ${place.userRatingsTotal} reviews` : ''

  return `${name} is a popular ${type} located in ${place.address || 'this area'}. ${rating} ${reviews}. A must-visit destination that offers a unique experience for travelers. Check the opening hours before visiting and consider arriving early to avoid crowds.`.trim()
}

module.exports = { generatePlaceDescription }
