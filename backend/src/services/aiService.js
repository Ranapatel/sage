const axios = require('axios')

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'
const MODEL = 'llama-3.3-70b-versatile'

/**
 * Generate AI-powered itinerary using Groq LLaMA3
 */
async function generateItinerary({ destination, from, days, budget, currency = 'INR', style, preferences, members, startDate }) {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    console.warn('[TripSage] GROQ_API_KEY missing — generating mock itinerary');
    return { success: true, data: getMockItinerary({ destination, days, budget, members, startDate }) };
  }

  const currencySymbol = currency === 'INR' ? 'Rs.' : currency
  const budgetDisplay = `${currencySymbol}${Number(budget).toLocaleString('en-IN')} ${currency}`
  // Strip country suffix for cleaner AI references ("Bangkok, Thailand" -> "Bangkok")
  const destinationCity = destination.split(',')[0].trim()
  const originCity = from ? from.split(',')[0].trim() : null

  const systemPrompt = `You are TripSage, a professional AI travel planner.
Your job: generate a precise, day-by-day itinerary ONLY for the destination city.

CRITICAL LOCATION RULES — NEVER VIOLATE:
1. DESTINATION CITY: "${destinationCity}". Every single place, activity, landmark, restaurant, and attraction MUST be physically located in ${destinationCity} or its immediate surrounding area.
${originCity ? `2. ORIGIN CITY: "${originCity}" is ONLY where the traveler departs from. NEVER include any activity, place, or event in ${originCity}. NEVER reference ${originCity} in any place name, description, or recommendation.` : '2. Only include places that exist in the destination city.'}
3. PLACE NAME FORMAT: Each place name MUST follow this exact format:
   "[Specific Activity or Attraction Name] — [Exact Neighborhood, District, or Landmark in ${destinationCity}]"
   CORRECT examples for Bangkok:
   - "Chatuchak Weekend Market — Northern Bangkok, Chatuchak District"
   - "Grand Palace & Wat Phra Kaew Tour — Rattanakosin Island, Old City"
   - "Rooftop Dinner at Vertigo — Sathorn District, Silom"
   WRONG examples (FORBIDDEN):
   - "Museum Visit in Delhi" (wrong city)
   - "Nature Park Hike in Chennai" (wrong city, generic name)
   - "City Exploration" (no neighborhood specified)
4. COORDINATES: GPS coordinates must be REAL coordinates inside ${destinationCity}, not generic or approximate.
5. DESCRIPTIONS: All descriptions must reference specific ${destinationCity} landmarks, streets, or local context.

OTHER RULES:
- Return ONLY valid JSON, no explanations, no markdown
- Optimize for: budget, traveler style, group size
- Times must be logical and sequential per day
- CRITICAL: Total budget is strictly ${budgetDisplay}. Every recommendation MUST stay within this total budget.`

  const userPrompt = `Generate a ${days}-day travel itinerary for a trip TO ${destinationCity}.
Origin (departure city, DO NOT include in itinerary): ${originCity || 'unspecified'}
Destination (ALL activities MUST be here): ${destinationCity}
Starting date: ${startDate || 'unspecified'}. Use realistic YYYY-MM-DD strings for the "date" field.
Total budget: ${budgetDisplay} for ${members} people.
Travel style: ${style}
Preferences: ${preferences?.join(', ') || 'general sightseeing'}

STRICT RULES REMINDER:
- Every place.name MUST be: "[Specific Attraction] — [${destinationCity} Neighborhood/District]"
- ZERO places from ${originCity || 'origin city'} — ONLY places in ${destinationCity}
- GPS coordinates must be REAL coordinates in ${destinationCity}
- Sum of all estimatedCost values MUST NOT exceed ${budgetDisplay}
- If budget is too low for ${destinationCity}, set budgetWarning to a message suggesting the minimum required budget

Return JSON in this exact schema:
{
  "itinerary": [
    {
      "day": 1,
      "date": "",
      "places": [
        {
          "name": "[Specific Attraction Name] — [${destinationCity} Neighborhood]",
          "time": "09:00",
          "category": "culture|nature|dining|activity|transport|shopping|accommodation",
          "coordinates": [latitude, longitude],
          "description": "Brief description mentioning specific ${destinationCity} context, under 100 chars",
          "estimatedCost": 20
        }
      ]
    }
  ],
  "totalEstimatedCost": 500,
  "budgetBreakdown": {
    "flightsEstimate": 0,
    "hotelsEstimate": 0,
    "foodEstimate": 0,
    "activitiesEstimate": 0,
    "remainingBudget": 0
  },
  "budgetWarning": null,
  "tips": ["Tip 1 specific to ${destinationCity}", "Tip 2"]
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
      timeout: 30000,
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
    console.warn('[Groq AI] Falling back to mock itinerary due to API failure.')
    return {
      success: true,
      data: getMockItinerary({ destination, days, budget, members, startDate }),
      meta: {
        fallback: true,
        error: `Failed to generate real AI itinerary: ${errorMsg}`
      }
    }
  }
}

/**
 * AI-powered travel recommendations
 */
async function getRecommendations({ destination, category, budget, currency = 'INR', style }) {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) throw new Error('GROQ_API_KEY is missing')

  const currencySymbol = currency === 'INR' ? '₹' : currency
  const budgetDisplay = `${currencySymbol}${Number(budget).toLocaleString('en-IN')} ${currency}`

  try {
    const response = await axios.post(GROQ_API_URL, {
      model: MODEL,
      messages: [{
        role: 'user',
        content: `List top 5 ${category} in ${destination} for a ${style} traveler. Total budget is strictly ${budgetDisplay} — every recommendation MUST stay within this budget.
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

/**
 * Generates a high-quality mock itinerary for DEMO mode
 */
function getMockItinerary({ destination, days, budget, members, startDate }) {
  const start = startDate ? new Date(startDate) : new Date();
  const itinerary = [];
  const city = destination.split(',')[0].trim()

  const activityTemplates = [
    { name: `Morning Walking Tour — ${city} Old Town`, category: 'culture', desc: `Discover historic streets and local life in ${city}'s old quarter.` },
    { name: `Local Street Food Experience — ${city} Night Market`, category: 'dining', desc: `Savoring authentic flavors at highly-rated ${city} street stalls.` },
    { name: `${city} City Museum — Cultural District`, category: 'culture', desc: `Discovering art, history and heritage at ${city}'s premier museum.` },
    { name: `Nature Reserve & Gardens — ${city} Outskirts`, category: 'nature', desc: `Enjoying scenic views and fresh air in ${city}'s green spaces.` },
    { name: `${city} Local Market Shopping — Central Bazaar`, category: 'shopping', desc: `Exploring local markets and boutiques for unique ${city} finds.` },
    { name: `Sunset Viewpoint — ${city} Hilltop District`, category: 'activity', desc: `Panoramic views of ${city} as the day ends. Best spot for photos.` }
  ];

  for (let i = 1; i <= days; i++) {
    const currentDate = new Date(start);
    currentDate.setDate(start.getDate() + i - 1);
    
    const places = [];
    const numPlaces = Math.floor(Math.random() * 2) + 2; // 2-3 places per day
    
    for (let j = 0; j < numPlaces; j++) {
      const template = activityTemplates[Math.floor(Math.random() * activityTemplates.length)];
      places.push({
        name: template.name,
        time: j === 0 ? '10:00' : j === 1 ? '14:00' : '18:00',
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
      `Book local transport in ${city} in advance for better rates.`,
      `Try ${city} street food for an authentic local experience.`,
      'Carry a power bank for long exploration days.'
    ]
  };
}

/**
 * Generate 12 top places for exploration using Groq
 */
async function getExplorePlaces(destination) {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    throw new Error('GROQ_API_KEY is missing')
  }

  const destinationCity = destination.split(',')[0].trim()

  const userPrompt = `given destination city "${destinationCity}", return top 12 places categorized as Must See landmarks, Local Food spots, Hidden Gems, and Outdoor Activities — each with name, category, short description, estimated cost in INR, and best time to visit.
Return ONLY a valid JSON object with the format:
{
  "places": [
    {
      "name": "Place Name",
      "category": "Must See" | "Local Food" | "Hidden Gems" | "Outdoor",
      "description": "Short description of the place",
      "cost": 150, // estimated cost in INR as a number (e.g. entry fee or avg meal cost)
      "bestTime": "Best time to visit (e.g., Early morning, Evening, 9 AM - 5 PM)"
    }
  ]
}`

  const response = await axios.post(GROQ_API_URL, {
    model: MODEL,
    messages: [
      {
        role: 'system',
        content: 'You are a professional travel assistant. You only output valid JSON.'
      },
      {
        role: 'user',
        content: userPrompt
      }
    ],
    max_tokens: 1500,
    temperature: 0.3,
    response_format: { type: 'json_object' }
  }, {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    timeout: 15000
  })

  const content = response.data.choices[0]?.message?.content
  const parsed = JSON.parse(content)
  return parsed.places || []
}

function generateMockPlaces(destination) {
  const city = destination.split(',')[0].trim()
  
  // Custom mock data for popular destinations
  const isGoa = city.toLowerCase().includes('goa')
  const isBali = city.toLowerCase().includes('bali')
  const isDubai = city.toLowerCase().includes('dubai')
  const isBangkok = city.toLowerCase().includes('bangkok')
  const isSingapore = city.toLowerCase().includes('singapore')

  if (isGoa) {
    return [
      { name: 'Basilica of Bom Jesus', category: 'Must See', description: 'UNESCO World Heritage Site holding the remains of St. Francis Xavier.', cost: 0, bestTime: '9:00 AM - 6:30 PM' },
      { name: 'Fort Aguada', category: 'Must See', description: 'A well-preserved 17th-century Portuguese fort standing on Sinquerim Beach.', cost: 50, bestTime: '9:30 AM - 6:00 PM' },
      { name: 'Baga Beach', category: 'Must See', description: 'Famous for water sports, beach shacks, and vibrant nightlife.', cost: 0, bestTime: 'Sunset' },
      { name: 'Dudhsagar Waterfalls', category: 'Outdoor', description: 'Four-tiered majestic waterfall on the Mandovi River, surrounded by forests.', cost: 400, bestTime: 'October to May' },
      { name: 'Anjuna Flea Market', category: 'Local Food', description: 'Bustling beachfront market known for local spices, street food, and souvenirs.', cost: 0, bestTime: 'Wednesdays' },
      { name: 'Mum\'s Kitchen', category: 'Local Food', description: 'Renowned restaurant serving authentic traditional Goan cuisine in Panaji.', cost: 800, bestTime: 'Lunch or Dinner' },
      { name: 'Curlies Beach Shack', category: 'Local Food', description: 'Iconic beachfront eatery offering fresh seafood and stunning sea views.', cost: 600, bestTime: 'Sunset onwards' },
      { name: 'Chorao Island', category: 'Hidden Gems', description: 'Serene island home to the Salim Ali Bird Sanctuary, accessible by ferry.', cost: 100, bestTime: 'Early morning' },
      { name: 'Cola Beach Lagoon', category: 'Hidden Gems', description: 'A hidden paradise beach with a freshwater lagoon near the sea.', cost: 0, bestTime: 'Afternoon' },
      { name: 'Devil\'s Canyon', category: 'Hidden Gems', description: 'A mysterious river canyon in the jungle near Mollem.', cost: 50, bestTime: 'Morning' },
      { name: 'Grande Island Snorkeling', category: 'Outdoor', description: 'Thrilling boat trip offering snorkeling, fishing, and dolphin spotting.', cost: 1500, bestTime: '8:00 AM - 2:00 PM' },
      { name: 'Netravali Bubble Lake', category: 'Outdoor', description: 'A sacred lake that naturally bubbles when you clap your hands.', cost: 20, bestTime: 'Morning' }
    ]
  }

  if (isBali) {
    return [
      { name: 'Uluwatu Temple', category: 'Must See', description: 'Sea temple perched on a cliff edge, famous for traditional Kecak fire dances.', cost: 300, bestTime: 'Sunset' },
      { name: 'Tegallalang Rice Terraces', category: 'Must See', description: 'Scenic valley of terraced paddy fields offering beautiful walking trails.', cost: 100, bestTime: 'Early morning' },
      { name: 'Tanah Lot Temple', category: 'Must See', description: 'Iconic pilgrimage temple sitting on a rock formation surrounded by crashing waves.', cost: 350, bestTime: 'Late afternoon' },
      { name: 'Nusa Penida Kelingking Beach', category: 'Outdoor', description: 'Dramatic T-Rex shaped cliff view overlooking a white sand beach.', cost: 150, bestTime: 'Morning' },
      { name: 'Warung Ibu Oka', category: 'Local Food', description: 'Famous eatery in Ubud renowned for serving Bali\'s signature roasted delicacies.', cost: 250, bestTime: 'Lunch' },
      { name: 'Naughty Nuri\'s Warung', category: 'Local Food', description: 'Iconic spot famous for legendary flame-grilled pork ribs.', cost: 600, bestTime: 'Dinner' },
      { name: 'Potato Head Beach Club', category: 'Local Food', description: 'Premium beachside venue serving locally infused drinks and snacks.', cost: 1000, bestTime: 'Sunset onwards' },
      { name: 'Sidemen Valley', category: 'Hidden Gems', description: 'Quiet rural escape with lush green landscapes and Mount Agung views.', cost: 0, bestTime: 'Morning' },
      { name: 'Tirta Sudamala Temple', category: 'Hidden Gems', description: 'Peaceful water temple utilized by locals for spiritual purification.', cost: 120, bestTime: 'Morning' },
      { name: 'Peguyangan Waterfall', category: 'Hidden Gems', description: 'Blue stairs leading down a cliffside to a sacred spring with sea views.', cost: 60, bestTime: 'Morning' },
      { name: 'Mount Batur Sunrise Trek', category: 'Outdoor', description: 'Active volcano climb offering incredible sunrise views above the clouds.', cost: 2000, bestTime: '2:00 AM - 8:00 AM' },
      { name: 'Sekumpul Waterfall', category: 'Outdoor', description: 'Majestic cluster of seven tall waterfalls surrounded by lush tropical jungle.', cost: 150, bestTime: 'Morning' }
    ]
  }

  // General fallbacks for other places
  return [
    { name: `${city} City Center Landmark`, category: 'Must See', description: 'The historic and cultural center of the city, perfect for photography and sightseeing.', cost: 0, bestTime: 'Morning' },
    { name: `Grand Cathedral / Temple`, category: 'Must See', description: 'Stunning architecture reflecting the deep-rooted heritage of the local community.', cost: 150, bestTime: '10:00 AM - 4:00 PM' },
    { name: `Central Public Park`, category: 'Must See', description: 'Lush green landscape featuring fountains, local flowers, and walking tracks.', cost: 0, bestTime: 'Evening' },
    { name: `Traditional Food Market`, category: 'Local Food', description: 'Vibrant local bazaar offering street food, fresh produce, and local spices.', cost: 200, bestTime: 'Evening' },
    { name: `Heritage Diner`, category: 'Local Food', description: 'Renowned diner serving authentic local recipes passed down through generations.', cost: 450, bestTime: 'Lunch' },
    { name: `Scenic Viewpoint Café`, category: 'Local Food', description: 'A cozy hillside café serving local beverages with panoramic views of the city.', cost: 300, bestTime: 'Sunset' },
    { name: `Secret Botanical Garden`, category: 'Hidden Gems', description: 'A quiet, less crowded sanctuary housing rare plants and peaceful walking trails.', cost: 80, bestTime: 'Morning' },
    { name: `Historical Archive Museum`, category: 'Hidden Gems', description: 'Fascinating museum displaying rare relics and stories of the city\'s origins.', cost: 50, bestTime: '10:00 AM - 5:00 PM' },
    { name: `Ancient Ruins in Forest`, category: 'Hidden Gems', description: 'Overgrown structural ruins of historical significance nestled deep in the forest.', cost: 100, bestTime: 'Daytime' },
    { name: `Scenic Mountain Trail`, category: 'Outdoor', description: 'A beautiful hiking trail leading up to the highest peak overlooking the valley.', cost: 0, bestTime: 'Early morning' },
    { name: `River Rafting Adventure`, category: 'Outdoor', description: 'Thrilling white-water rafting experience down the city\'s primary river.', cost: 1200, bestTime: '9:00 AM - 2:00 PM' },
    { name: `Caves Exploration Tour`, category: 'Outdoor', description: 'A guided hike through ancient limestone caves filled with stalactites and stalagmites.', cost: 350, bestTime: 'Daytime' }
  ]
}

module.exports = { generateItinerary, getRecommendations, optimizeBudget, estimateFlightPrices, getExplorePlaces, generateMockPlaces }

