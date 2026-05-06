const axios = require('axios')

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'
const MODEL = 'llama-3.3-70b-versatile'

/**
 * Generate AI-powered itinerary using Groq LLaMA3
 */
async function generateItinerary({ destination, days, budget, style, preferences, members, startDate }) {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    console.warn('[TripSage] ⚠️  GROQ_API_KEY missing — generating mock itinerary');
    return { success: true, data: getMockItinerary({ destination, days, budget, members, startDate }) };
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
    const errorMsg = err.response?.data?.error?.message || err.message
    console.error('[Groq AI] Error:', errorMsg)
    
    // Fallback to mock itinerary on rate limit to prevent 500 errors
    if (err.response?.status === 429 || errorMsg.toLowerCase().includes('rate limit')) {
      console.warn('[TripSage] ⚠️ Rate limit hit — falling back to mock itinerary')
      return { success: true, data: getMockItinerary({ destination, days, budget, members, startDate }), mockFallback: true }
    }
    
    throw new Error('Failed to generate real AI itinerary: ' + errorMsg)
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
      model: 'llama-3.1-8b-instant',
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

/**
 * Generates a high-quality mock itinerary for DEMO mode
 */
function getMockItinerary({ destination, days, budget, members, startDate }) {
  const start = startDate ? new Date(startDate) : new Date();
  const itinerary = [];

  const activityTemplates = [
    { name: "City Exploration", category: "culture", desc: "Walking tour of the historic city center and main landmarks." },
    { name: "Local Cuisine Tour", category: "dining", desc: "Savoring authentic flavors at highly-rated local eateries." },
    { name: "Museum Visit", category: "culture", desc: "Discovering art and history at the city's premier museum." },
    { name: "Nature Park Hike", category: "nature", desc: "Enjoying the fresh air and scenic views in a lush green park." },
    { name: "Shopping Spree", category: "shopping", desc: "Exploring local markets and boutiques for unique finds." },
    { name: "Sunset Viewpoint", category: "activity", desc: "Perfect spot for panoramic photos as the day ends." }
  ];

  for (let i = 1; i <= days; i++) {
    const currentDate = new Date(start);
    currentDate.setDate(start.getDate() + i - 1);
    
    const places = [];
    const numPlaces = Math.floor(Math.random() * 2) + 2; // 2-3 places per day
    
    for (let j = 0; j < numPlaces; j++) {
      const template = activityTemplates[Math.floor(Math.random() * activityTemplates.length)];
      places.push({
        name: `${template.name} in ${destination}`,
        time: j === 0 ? "10:00" : j === 1 ? "14:00" : "18:00",
        category: template.category,
        coordinates: [20.0 + Math.random(), 70.0 + Math.random()],
        description: template.desc,
        estimatedCost: Math.floor((budget / (days * (numPlaces || 1))) * 0.8)
      });
    }

    itinerary.push({
      day: i,
      date: currentDate.toISOString().split('T')[0],
      places
    });
  }

  return {
    itinerary,
    totalEstimatedCost: Math.floor(budget * 0.9),
    tips: [
      "Book local transport in advance for better rates.",
      "Try street food for an authentic experience.",
      "Carry a power bank for long exploration days."
    ]
  };
}

/**
 * AI-powered realistic bus price estimation using Groq
 * Uses the lighter llama-3.1-8b-instant model to conserve token quota
 */
async function estimateBusPrices({ from, to, date, budget }) {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) return null

  const prompt = `You are an Indian bus travel pricing expert. Estimate realistic bus ticket prices in INR for this route.

Route: ${from} → ${to}
Date: ${date || 'next month'}
Budget hint: ₹${budget || 'any'}

Return ONLY this JSON (no explanation, no markdown):
{
  "buses": [
    { "operator": "IntrCity SmartBus", "busType": "AC Sleeper (2+1)", "price": 1200, "departure": "21:00", "duration": "10h 30m", "stops": 1 },
    { "operator": "VRL Travels", "busType": "AC Semi Sleeper (2+2)", "price": 900, "departure": "20:00", "duration": "11h 00m", "stops": 2 },
    { "operator": "Orange Tours", "busType": "Scania Multi-Axle", "price": 1500, "departure": "22:30", "duration": "9h 45m", "stops": 0 },
    { "operator": "SRS Travels", "busType": "Non-AC Sleeper (2+1)", "price": 600, "departure": "18:00", "duration": "13h 00m", "stops": 3 },
    { "operator": "Zingbus", "busType": "Volvo Multi-Axle I-Shift", "price": 1100, "departure": "23:00", "duration": "10h 00m", "stops": 1 }
  ],
  "distanceKm": 580,
  "routeNote": "overnight route via NH48"
}

Rules:
- All prices in INR
- Realistic for Indian bus market (₹300–₹3,500 typical range)
- If route is very long (>800km) or crosses water/mountains, prices may be higher
- If route seems international/impossible by bus, return empty buses array
- Use operators that actually serve this region`

  try {
    const response = await axios.post(GROQ_API_URL, {
      model: 'llama-3.1-8b-instant',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 500,
      temperature: 0.1,
    }, {
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      timeout: 8000,
    })

    const content = response.data.choices[0]?.message?.content
    const jsonMatch = content?.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return null

    const parsed = JSON.parse(jsonMatch[0])
    if (!Array.isArray(parsed?.buses)) return null

    console.log(`[Groq] ✅ AI estimated ${parsed.buses.length} bus prices for ${from} → ${to}`)
    return { buses: parsed.buses, distanceKm: parsed.distanceKm, routeNote: parsed.routeNote }
  } catch (err) {
    console.warn('[Groq] Bus price estimation failed:', err.response?.data?.error?.message || err.message)
    return null
  }
}

module.exports = { generateItinerary, getRecommendations, optimizeBudget, estimateFlightPrices, estimateBusPrices }

