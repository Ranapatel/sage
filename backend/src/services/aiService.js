/**
 * TripSage AI Service — Groq LLaMA3
 *
 * RULES (HARD):
 *  - Groq is used ONLY for:
 *      1. Itinerary generation (day-by-day plan, not prices)
 *      2. Budget optimization advice (text output)
 *      3. Ranking / personalization of API-fetched results
 *  - Groq MUST NOT invent flight prices, hotel prices, or ratings.
 *  - estimateFlightPrices() has been REMOVED — prices come from APIs only.
 */

'use strict'

const axios = require('axios')

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'
const MODEL        = 'llama-3.3-70b-versatile'

// ─── Helper ───────────────────────────────────────────────────────────────────

function groqHeaders() {
  return {
    Authorization:  `Bearer ${process.env.GROQ_API_KEY}`,
    'Content-Type': 'application/json',
  }
}

async function groqComplete({ messages, maxTokens = 3000, temperature = 0.3 }) {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) throw new Error('GROQ_API_KEY is not configured')

  const response = await axios.post(GROQ_API_URL, {
    model:      MODEL,
    messages,
    max_tokens: maxTokens,
    temperature,
  }, {
    headers: groqHeaders(),
    timeout: 20000,
  })

  const content = response.data.choices?.[0]?.message?.content
  if (!content) throw new Error('Empty AI response')
  return content
}

// ─── 1. Itinerary Generation ──────────────────────────────────────────────────

async function generateItinerary({ destination, days, budget, style, preferences, members, startDate }) {
  const systemPrompt = `You are TripSage — an AI travel planner.
Your task: Generate a detailed day-by-day travel itinerary.
CRITICAL RULES:
- Return ONLY valid JSON, no markdown, no explanation
- Only include real, verifiable places that exist in ${destination}
- Do NOT invent prices, hotel names, or flight times
- Optimize for: budget, traveler style, group size
- Include realistic GPS coordinates for each place
- Times must be logical and sequential`

  const userPrompt = `Generate a ${days}-day itinerary for ${destination}.
Starting date: ${startDate || 'unspecified'} (use YYYY-MM-DD for each "date" field).
Budget: ₹${budget} total for ${members} people (INR)
Style: ${style}
Preferences: ${preferences?.join(', ') || 'general sightseeing'}

Return JSON in this exact schema:
{
  "itinerary": [
    {
      "day": 1,
      "date": "",
      "places": [
        {
          "name": "Place Name",
          "time": "09:00",
          "category": "culture|nature|dining|activity|transport|shopping|accommodation",
          "coordinates": [latitude, longitude],
          "description": "Brief description under 100 chars",
          "estimatedCost": 200
        }
      ]
    }
  ],
  "totalEstimatedCost": 5000,
  "tips": ["Tip 1", "Tip 2"]
}`

  try {
    const content = await groqComplete({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: userPrompt },
      ],
      maxTokens:   3000,
      temperature: 0.3,
    })

    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON found in AI response')

    const parsed = JSON.parse(jsonMatch[0])
    if (!parsed.itinerary || !Array.isArray(parsed.itinerary)) {
      throw new Error('Invalid itinerary format from AI')
    }

    return { success: true, data: parsed }
  } catch (err) {
    console.error('[Groq AI] Itinerary error:', err.response?.data?.error?.message || err.message)
    throw new Error('Failed to generate itinerary: ' + (err.response?.data?.error?.message || err.message))
  }
}

// ─── 2. Budget Optimization ───────────────────────────────────────────────────

async function optimizeBudget({ destination, days, budget, style, preferences, members }) {
  const systemPrompt = `ROLE:
You are a Budget Optimization Engine for a travel platform.
CORE OBJECTIVE: Maximize user value under strict financial constraints.

RULES:
1. NEVER exceed the user's total budget.
2. Always provide 3 plan options: Cheapest, Balanced, Premium-within-Budget.
3. Break down budget: Transport | Accommodation | Food | Activities | Buffer (min 10%).
4. If budget insufficient: suggest trade-offs and a revised feasible plan.
5. All prices MUST be in Indian Rupees (₹). NEVER use $ or USD.
6. Do NOT suggest unrealistic prices (e.g., ₹3,00,000 for standard domestic travel).
7. Highlight savings vs. average market price.
8. Provide: Book Now / Wait / Flexible recommendations.`

  const userPrompt = `Destination: ${destination}
Duration: ${days} days
Total Budget: ₹${budget} INR for ${members} people
Travel Style: ${style}
Preferences: ${preferences?.join(', ') || 'general'}

Provide a structured budget breakdown with 3 plan options.`

  try {
    const content = await groqComplete({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: userPrompt },
      ],
      maxTokens:   4000,
      temperature: 0.2,
    })

    return { success: true, data: content }
  } catch (err) {
    console.error('[Groq AI] Budget optimizer error:', err.message)
    throw new Error('Failed to generate budget optimization.')
  }
}

// ─── 3. AI Ranking of Real API Results ───────────────────────────────────────
// Receives API-fetched flights/hotels, returns ranked order with scores.
// AI MUST NOT add, modify, or invent any data fields.

async function rankResults({ flights = [], hotels = [], userProfile = {} }) {
  if (flights.length === 0 && hotels.length === 0) return { flights, hotels }

  const prompt = `You are a travel ranking engine.
Given the following real API results and user profile, re-rank the items by best match.
DO NOT modify any data fields. ONLY return the re-ranked IDs in priority order.

User Profile: ${JSON.stringify(userProfile)}
Flights (${flights.length}): ${JSON.stringify(flights.map(f => ({ id: f.id, price: f.price, stops: f.stops, duration: f.duration })))}
Hotels (${hotels.length}): ${JSON.stringify(hotels.map(h => ({ id: h.id, price: h.price, rating: h.rating, name: h.name })))}

Return ONLY this JSON (no explanation):
{
  "flightIds": ["id1", "id2"],
  "hotelIds":  ["id1", "id2"]
}`

  try {
    const content = await groqComplete({
      messages:    [{ role: 'user', content: prompt }],
      maxTokens:   500,
      temperature: 0.1,
    })

    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return { flights, hotels }

    const parsed      = JSON.parse(jsonMatch[0])
    const flightOrder = parsed.flightIds || []
    const hotelOrder  = parsed.hotelIds  || []

    const rerankedFlights = flightOrder.length > 0
      ? flightOrder.map(id => flights.find(f => f.id === id)).filter(Boolean)
      : flights
    const rerankedHotels = hotelOrder.length > 0
      ? hotelOrder.map(id => hotels.find(h => h.id === id)).filter(Boolean)
      : hotels

    console.log(`[Groq AI] ✅ Ranked ${rerankedFlights.length} flights, ${rerankedHotels.length} hotels`)
    return { flights: rerankedFlights, hotels: rerankedHotels }
  } catch (err) {
    console.warn('[Groq AI] Ranking failed — returning original order:', err.message)
    return { flights, hotels }
  }
}

// ─── 4. Travel Recommendations ────────────────────────────────────────────────
// Returns place/activity recommendations (NOT prices or hotel/flight data)

async function getRecommendations({ destination, category, budget, style }) {
  try {
    const content = await groqComplete({
      messages: [{
        role:    'user',
        content: `List the top 5 real ${category} spots in ${destination} for a ${style} traveler with ₹${budget} INR budget.
Only include well-known, verifiable places. Do NOT invent ratings or prices.
Return ONLY JSON: {"recommendations": [{"name": "", "description": "", "category": "", "googleMapsQuery": ""}]}`,
      }],
      maxTokens:   800,
      temperature: 0.3,
    })

    const jsonMatch = content?.match(/\{[\s\S]*\}/)
    const parsed    = jsonMatch ? JSON.parse(jsonMatch[0]) : {}
    return { success: true, data: parsed.recommendations || [] }
  } catch (err) {
    throw new Error('Recommendations generation failed: ' + err.message)
  }
}

// ─── Exports ──────────────────────────────────────────────────────────────────
module.exports = {
  generateItinerary,
  optimizeBudget,
  rankResults,
  getRecommendations,
}
