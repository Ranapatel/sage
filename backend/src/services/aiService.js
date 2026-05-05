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
  const systemPrompt = `You are TripSage — an AI travel planning engine integrated with a mapping system.
CRITICAL RULES:
- Return ONLY valid JSON, no markdown, no explanations, no code fences
- Only include real, well-known, verifiable places that exist in ${destination}
- Do NOT invent prices, hotel names, or flight times
- Optimize for: budget, traveler style, group size
- Include ACCURATE real-world GPS coordinates for EVERY place (no random values)
- Times must be logical and sequential (09:00 → 11:00 → 13:00 etc.)
- Normalize city name (e.g. "Vizag" → "Visakhapatnam")

MANDATORY RULES:
1. Each day must contain 3–6 places.
2. Each place MUST include valid lat and lng, and correct visiting order.
3. Assign colors per day: Day 1 → blue, Day 2 → green, Day 3 → red, Day 4 → purple, Day 5+ → orange.
4. Route path: Include at least 2–5 coordinate points connecting places in "route.path".
5. Ensure locations are geographically logical (no long unrealistic jumps).

MAP COMPATIBILITY GOAL:
Your JSON must allow frontend to instantly render markers (no geocoding needed), color markers per day, label markers (day-order format like "1-1", "1-2"), draw polylines using "route.path", and auto-fit map bounds using all coordinates.

FAIL-SAFE RULES:
- If exact coordinates are unknown → estimate realistically.
- Do NOT skip coordinates or lat/lng.
- Do NOT return empty arrays or duplicate IDs.
- Do NOT generate fictional places.`

  const userPrompt = `Generate a ${days}-day itinerary for ${destination}.
Starting date: ${startDate || 'unspecified'} (use YYYY-MM-DD for each "date" field).
Budget: ₹${budget} total for ${members} people (INR)
Style: ${style}
Preferences: ${preferences?.join(', ') || 'general sightseeing'}

STRICT OUTPUT FORMAT — production map-ready JSON:
{
  "city": "${destination}",
  "state": "",
  "country": "India",
  "coordinates": { "lat": 0.0, "lng": 0.0 },
  "itinerary": [
    {
      "day": 1,
      "date": "YYYY-MM-DD",
      "color": "blue",
      "places": [
        {
          "name": "Place Name",
          "address": "Full street address",
          "lat": 17.71,
          "lng": 83.32,
          "day": 1,
          "order": 1,
          "label": "1-1",
          "time": "09:00",
          "type": "beach|temple|museum|park|viewpoint|market|restaurant|activity",
          "category": "culture|nature|dining|activity|transport|shopping|accommodation",
          "description": "Brief description under 100 chars",
          "estimatedCost": 200
        }
      ],
      "route": {
        "distance_km": 12,
        "estimated_time": "30 mins",
        "path": [[17.71, 83.32], [17.72, 83.33], [17.73, 83.34]]
      }
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
      maxTokens:   3500,
      temperature: 0.3,
    })

    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON found in AI response')

    const parsed = JSON.parse(jsonMatch[0])

    // Support both old format (parsed.itinerary) and fallback
    const rawItinerary = parsed.itinerary || parsed.days || []
    if (!Array.isArray(rawItinerary) || rawItinerary.length === 0) {
      throw new Error('Invalid itinerary format from AI')
    }

    // Normalise each place: ensure both coordinates[] and flat lat/lng exist
    const normalised = rawItinerary.map((day, dayIdx) => ({
      ...day,
      day: day.day || dayIdx + 1,
      places: (day.places || []).map((p, placeIdx) => {
        // Resolve lat/lng from wherever they may be
        const lat = p.lat != null ? p.lat : (Array.isArray(p.coordinates) ? p.coordinates[0] : null)
        const lng = p.lng != null ? p.lng : (Array.isArray(p.coordinates) ? p.coordinates[1] : null)
        return {
          ...p,
          day:   day.day || dayIdx + 1,
          order: p.order != null ? p.order : placeIdx + 1,
          lat,
          lng,
          // Keep array format for map backward-compat
          coordinates: (lat !== null && lng !== null) ? [lat, lng] : [],
        }
      }),
    }))

    return {
      success: true,
      data: {
        ...parsed,
        itinerary: normalised,
      },
    }
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
