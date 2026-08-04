/**
 * AI Description Service — Generates structured travel intelligence
 * using Groq LLaMA when Google editorial summaries are unavailable.
 */

const axios = require('axios')
const { cacheGet, cacheSet, generateCacheKey } = require('../../config/redis')

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'
const MODEL = 'openai/gpt-oss-120b'

const BANNED_WORDS_REGEX = /\b(beautiful|charming|stunning|picturesque|nestled|offers a glimpse|soak in the ambience|leisurely|hidden gem|breathtaking|magical|vibrant|oasis|testament)\b/gi

/**
 * Clean & sanitize summary object to guarantee strict compliance.
 */
function sanitizeSummaryObject(obj) {
  if (!obj || typeof obj !== 'object') return null

  const cleanText = (str) => {
    if (!str || typeof str !== 'string') return null
    let sanitized = str.replace(BANNED_WORDS_REGEX, '').replace(/\s+/g, ' ').trim()
    return sanitized || null
  }

  const cleanList = (arr) => {
    if (!Array.isArray(arr)) return []
    return arr
      .map(cleanText)
      .filter(Boolean)
      .slice(0, 3)
  }

  const summary = cleanText(obj.summary)
  const highlights = cleanList(obj.highlights)
  const bestTime = cleanText(obj.bestTime)
  const practicalTip = cleanText(obj.practicalTip)

  // Enforce word count limit (< 120 words total)
  const allText = [summary, ...highlights, bestTime, practicalTip].filter(Boolean).join(' ')
  const words = allText.split(/\s+/).filter(Boolean)

  if (words.length > 120) {
    const trimmedSummary = (summary || '').split(/\s+/).slice(0, 35).join(' ')
    return {
      summary: trimmedSummary ? `${trimmedSummary}...` : null,
      highlights: highlights.slice(0, 2),
      bestTime,
      practicalTip
    }
  }

  return {
    summary: summary || (highlights.length > 0 ? highlights[0] : null),
    highlights,
    bestTime,
    practicalTip
  }
}

/**
 * Parse LLM output into structured object.
 */
function parseLLMResponse(rawText) {
  if (!rawText) return null
  let text = rawText.trim()

  if (text.startsWith('```')) {
    text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()
  }

  try {
    const json = JSON.parse(text)
    return sanitizeSummaryObject(json)
  } catch (e) {
    const sentences = text.split(/(?<=[.!?])\s+/).filter(Boolean)
    const summary = sentences[0] || text
    const highlights = sentences.slice(1, 3)
    return sanitizeSummaryObject({
      summary,
      highlights,
      bestTime: null,
      practicalTip: null
    })
  }
}

/**
 * Generate AI-powered structured travel intelligence for a place.
 *
 * @param {object} place
 * @returns {Promise<object>} Structured travel intelligence
 */
async function generatePlaceDescription(place) {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    console.warn('[AIDescription] GROQ_API_KEY not configured — returning fallback summary')
    return generateFallbackDescription(place)
  }

  const cacheKey = generateCacheKey('ai_desc_v2', { id: place.name, addr: place.address })
  try {
    const cached = await cacheGet(cacheKey)
    if (cached) {
      const parsed = typeof cached === 'string' ? parseLLMResponse(cached) : sanitizeSummaryObject(cached)
      if (parsed) return parsed
    }
  } catch { /* Redis fallback */ }

  const reviewContext = (place.reviewSnippets || []).slice(0, 3).join(' | ')
  const ratingText = place.rating ? `${place.rating}/5 stars from ${place.userRatingsTotal || 0} reviews` : ''

  const systemPrompt = `You are a concise travel intelligence engine for TripSage.
Your task is to generate structured travel intelligence for a place in JSON format ONLY.

OUTPUT JSON SCHEMA:
{
  "summary": "1-2 factual sentences (max 30 words) stating exact nature and location of the place.",
  "highlights": ["2-3 specific features, attractions, or exhibits"],
  "bestTime": "Recommended visit timing or duration (e.g. '1.5-2 hours | Early morning or late afternoon'). Set null if unknown.",
  "practicalTip": "1 actionable visitor tip (e.g. footwear, advance booking, modest dress). Set null if unknown."
}

CRITICAL CONSTRAINTS:
1. TOTAL WORD COUNT ACROSS ALL FIELDS MUST BE UNDER 90 WORDS.
2. NEVER generate a single large paragraph or unstructured block of text.
3. ABSOLUTELY NO FILLER OR REPETITIVE ADJECTIVES: DO NOT USE beautiful, charming, stunning, picturesque, nestled, offers a glimpse, soak in the ambience, leisurely, hidden gem, breathtaking, magical, vibrant, oasis, testament.
4. EVERY SENTENCE MUST PROVIDE PRACTICAL VALUE.
5. DO NOT HALLUCINATE facts, historical dates, or opening hours.
6. IF INFO IS MISSING, set bestTime or practicalTip to null.
7. Return ONLY valid JSON.`

  const userPrompt = `Place Name: ${place.name}
Type: ${place.primaryType || 'attraction'}
Address: ${place.address}
Rating: ${ratingText}
${reviewContext ? `Visitor Excerpts: "${reviewContext}"` : ''}`

  try {
    const response = await axios.post(GROQ_API_URL, {
      model: MODEL,
      reasoning_effort: 'medium',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.3,
      max_tokens: 250,
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 8000
    })

    const text = response.data?.choices?.[0]?.message?.content?.trim()
    const result = parseLLMResponse(text)

    if (result) {
      try { await cacheSet(cacheKey, JSON.stringify(result), 604800) } catch { /* silent */ }
      return result
    }

    return generateFallbackDescription(place)
  } catch (err) {
    console.warn('[AIDescription] Groq API failed:', err.message)
    return generateFallbackDescription(place)
  }
}

/**
 * Generate a structured fallback description when AI is unavailable.
 */
function generateFallbackDescription(place) {
  const name = place.name || 'This attraction'
  const type = (place.primaryType || 'destination').replace(/_/g, ' ')
  
  return {
    summary: `${name} is a ${type} located in ${place.address || 'this area'}.`,
    highlights: place.rating ? [`Visitor Rating: ${place.rating}/5 (${place.userRatingsTotal || 0} reviews)`] : [],
    bestTime: '1-2 hours recommended',
    practicalTip: 'Check opening schedule before visiting.'
  }
}

module.exports = { generatePlaceDescription }


