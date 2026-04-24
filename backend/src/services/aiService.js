const axios = require('axios')

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'
const MODEL = 'llama-3.3-70b-versatile'

/**
 * Generate AI-powered itinerary using Groq LLaMA3
 */
async function generateItinerary({ destination, days, budget, style, preferences, members, startDate }) {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    throw new Error('GROQ_API_KEY is not configured')
  }

  const systemPrompt = `You are TripSage — a real-time AI travel optimizer.
Your task: Generate a detailed day-by-day travel itinerary.
Rules:
- Return ONLY valid JSON, no explanations, no markdown
- No hallucinations — only real, well-known places
- Optimize for: budget, traveler style, group size
- Include realistic GPS coordinates for each place
- Times must be logical and sequential`

  const userPrompt = `Generate a ${days}-day itinerary for ${destination}.
Starting date: ${startDate || 'unspecified'}. Please use realistic YYYY-MM-DD strings for the "date" field for each day starting from this date.
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
          "estimatedCost": 20
        }
      ]
    }
  ],
  "totalEstimatedCost": 500,
  "tips": ["Tip 1", "Tip 2"]
}`

  try {
    const response = await axios.post(GROQ_API_URL, {
      model: MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 3000,
      temperature: 0.3,
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 15000,
    })

    const content = response.data.choices[0]?.message?.content
    if (!content) throw new Error('Empty AI response')

    // Extract JSON block from text (handles markdown code fences)
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON found in response')

    const parsed = JSON.parse(jsonMatch[0])
    if (!parsed.itinerary || !Array.isArray(parsed.itinerary)) {
      throw new Error('Invalid itinerary format')
    }

    return { success: true, data: parsed }
  } catch (err) {
    console.error('[Groq AI] Error:', err.response?.data?.error?.message || err.message)
    throw new Error('Failed to generate real AI itinerary: ' + (err.response?.data?.error?.message || err.message))
  }
}

/**
 * AI-powered travel recommendations
 */
async function getRecommendations({ destination, category, budget, style }) {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) throw new Error('GROQ_API_KEY is missing')

  try {
    const response = await axios.post(GROQ_API_URL, {
      model: MODEL,
      messages: [{
        role: 'user',
        content: `List top 5 ${category} in ${destination} for a ${style} traveler with ₹${budget} INR budget.
        Return only JSON: {"recommendations": [{"name": "", "description": "", "price": 0, "rating": 0, "category": ""}]}`
      }],
      max_tokens: 1000,
      temperature: 0.3,
    }, {
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      timeout: 10000,
    })

    const content = response.data.choices[0]?.message?.content
    const jsonMatch = content?.match(/\{[\s\S]*\}/)
    const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : {}
    return { success: true, data: parsed.recommendations || [] }
  } catch (err) {
    throw new Error('Recommendations generation failed: ' + err.message)
  }
}

async function optimizeBudget({ destination, days, budget, style, preferences, members }) {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) throw new Error('GROQ_API_KEY is not configured')

  const systemPrompt = `ROLE:
You are a Budget Optimization Engine for a travel platform. Your goal is to maximize user value under strict financial constraints while maintaining acceptable experience quality.
CORE OBJECTIVE:
Minimize total cost while maximizing weighted user satisfaction score.

FORMULA:
Satisfaction Score = 
(Experience Value × Priority Weight) 
- (Cost Overrun Penalty × 2) 
- (Time Inefficiency Penalty × Weight)

SYSTEM RULES:
1. NEVER exceed the user's total budget.
2. Always show at least 3 optimized plan options:
   - Cheapest Plan (Minimum Cost)
   - Balanced Plan (Best Value)
   - Premium within Budget (Max Experience)
3. Break down budget into:
   - Flights / Transport
   - Accommodation
   - Food
   - Activities
   - Buffer (minimum 10%)
4. If budget is insufficient:
   - Suggest trade-offs (dates, location, transport class, stay type)
   - Provide revised feasible plan
5. Use dynamic adjustments:
   - Suggest cheaper nearby destinations if original is expensive
   - Recommend off-season or mid-week travel
   - Bundle options when cheaper
6. Highlight savings:
   - Show "You saved ₹X compared to average market price"
7. Provide actionable decisions:
   - Book now / Wait / Flexible option
8. Prioritize:
   - High rating-to-price ratio
   - Low hidden costs
   - Time efficiency if user values time
9. CURRENCY: All monetary values MUST be in Indian Rupees (₹ INR). Never use the $ symbol or USD. Use '₹' exclusively.
10. PRICING ACCURACY: Ensure estimated costs are realistic and match real-time pricing for the region. Do NOT suggest exorbitantly high prices (e.g., 3,00,000 INR or 3L for standard flights/hotels) unless the budget explicitly demands ultimate luxury.

OUTPUT FORMAT:
- Summary of selected strategy
- 3 Plan Options (table format)
- Cost Breakdown per plan
- Savings insights
- Trade-offs explained clearly
- CTA: Book / Modify / Save Plan

BEHAVIOR:
- Think like a financial optimizer, not a tour guide
- Avoid generic suggestions
- Always justify choices with cost-benefit reasoning
- Adapt dynamically based on constraints`

  const userPrompt = `Destination: ${destination}
Days: ${days}
Budget: ₹${budget} INR for ${members} people
Style: ${style}
Preferences: ${preferences?.join(', ') || 'general'}
IMPORTANT: All prices must be in Indian Rupees (₹). Do NOT use the $ symbol or USD anywhere in your response. Ensure pricing is realistic and not artificially inflated.`

  try {
    const response = await axios.post(GROQ_API_URL, {
      model: MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 4000,
      temperature: 0.2,
    }, {
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      timeout: 20000,
    })

    const content = response.data.choices[0]?.message?.content
    if (!content) throw new Error('Empty AI response')

    return { success: true, data: content }
  } catch (err) {
    console.error('[Groq AI] Optimizer Error:', err.message)
    throw new Error('Failed to generate budget optimization.')
  }
}

module.exports = { generateItinerary, getRecommendations, optimizeBudget, estimateFlightPrices }

/**
 * AI-powered realistic flight price estimation using Groq
 */
async function estimateFlightPrices({ from, to, date, travelers = 1, budget }) {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) return null

  const prompt = `You are a flight pricing expert. Estimate realistic economy class flight prices in INR for this route.

Route: ${from} → ${to}
Date: ${date || 'next month'}
Travelers: ${travelers}
Budget hint: ₹${budget || 'any'}

Return ONLY this JSON (no explanation, no markdown):
{
  "flights": [
    { "airline": "IndiGo", "price": 4200, "departure": "06:00", "arrival": "08:15", "duration": "2h 15m", "stops": 0, "class": "Economy" },
    { "airline": "Air India", "price": 5100, "departure": "09:30", "arrival": "11:45", "duration": "2h 15m", "stops": 0, "class": "Economy" },
    { "airline": "SpiceJet", "price": 3800, "departure": "13:15", "arrival": "15:30", "duration": "2h 15m", "stops": 0, "class": "Economy" },
    { "airline": "Vistara", "price": 6200, "departure": "16:00", "arrival": "18:20", "duration": "2h 20m", "stops": 0, "class": "Economy" },
    { "airline": "Akasa Air", "price": 3500, "departure": "19:45", "arrival": "22:00", "duration": "2h 15m", "stops": 0, "class": "Economy" }
  ]
}

Rules:
- All prices must be in INR (Indian Rupees)
- Domestic flights: ₹2,500 - ₹15,000
- International flights (outside India): ₹15,000 - ₹80,000
- Prices must be realistic market rates, NOT inflated
- Use real airlines that actually operate this route`

  try {
    const response = await axios.post(GROQ_API_URL, {
      model: MODEL,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 600,
      temperature: 0.1,
    }, {
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      timeout: 8000,
    })

    const content = response.data.choices[0]?.message?.content
    const jsonMatch = content?.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return null

    const parsed = JSON.parse(jsonMatch[0])
    if (!Array.isArray(parsed?.flights) || parsed.flights.length === 0) return null

    console.log(`[Groq] ✅ AI estimated ${parsed.flights.length} flight prices for ${from} → ${to}`)
    return parsed.flights
  } catch (err) {
    console.warn('[Groq] Flight price estimation failed:', err.message)
    return null
  }
}

