import axios from 'axios'

interface AssistantContext {
  message: string
  latitude: number
  longitude: number
  currentTime: string // e.g. "15:30"
  weather: any
  itinerary: any[] // planned places
  preferences: {
    travelStyle?: string
    interests?: string[]
  }
}

export class TravelAssistantService {
  private static GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'
  private static MODEL = 'llama-3.3-70b-versatile'

  /**
   * Get contextual assistant advice based on maps, location, and itinerary.
   */
  static async getAssistantAdvice(context: AssistantContext) {
    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) {
      console.warn('[TravelAssistantService] GROQ_API_KEY is missing — returning mock assistant response')
      return this.getMockResponse(context)
    }

    const {
      message,
      latitude,
      longitude,
      currentTime,
      weather,
      itinerary = [],
      preferences,
    } = context

    const systemPrompt = `You are the TripSage AI Travel Navigator, an intelligent map companion.
You help travelers optimize their journey in real time based on their current location, time, schedule, weather, and preferences.

Analyze the given context:
- Current Coordinates: [${latitude}, ${longitude}]
- Current Time: ${currentTime}
- Weather: ${JSON.stringify(weather || 'unspecified')}
- Travel Preferences: Style: ${preferences?.travelStyle || 'general'}, Interests: ${preferences?.interests?.join(', ') || 'none'}
- Planned Itinerary Stops: ${JSON.stringify(itinerary.map(item => ({ name: item.name, time: item.visitTime || item.time, coords: [item.latitude || item.coordinates?.[0], item.longitude || item.coordinates?.[1]] })))}

Your task:
1. Provide a smart, friendly, short response (1-2 sentences) answering their query or guiding their next move.
2. If appropriate, recommend a specific location (either the next stop in their itinerary, a nearby detour, or a cafe/restaurant if they need a break).
3. Return ONLY a valid JSON object. Do not include markdown wraps or pre/post text.

JSON Schema format:
{
  "reply": "Your brief advice to the user. E.g. 'It looks like it started drizzling! I recommend popping into Vertigo Rooftop Bar next; it is only 5 minutes away and is covered.'",
  "recommendedPlace": "Vertigo Rooftop Bar",
  "coordinates": [13.723, 100.540],
  "reason": "It is close by, matches your luxury travel style, and offers shelter from the drizzle."
}`

    const userPrompt = `User Query: "${message}"`

    try {
      const response = await axios.post(
        this.GROQ_API_URL,
        {
          model: this.MODEL,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.3,
          max_tokens: 400,
          response_format: { type: 'json_object' },
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }
      )

      const content = response.data?.choices?.[0]?.message?.content
      if (content) {
        return JSON.parse(content)
      }
      throw new Error('Groq returned an empty response.')
    } catch (err: any) {
      console.error('[TravelAssistantService] Groq API error:', err.message)
      return this.getMockResponse(context)
    }
  }

  /**
   * Mock fallback response for offline/keyless developer mode.
   */
  private static getMockResponse(context: AssistantContext) {
    const nextPlace = context.itinerary.find(p => p.status !== 'completed') || context.itinerary[0]
    
    if (nextPlace) {
      const name = nextPlace.name.split(' — ')[0]
      return {
        reply: `You're currently near ${context.itinerary.find(p => p.status === 'completed')?.name || 'your starting point'}. The next stop on your itinerary is ${name}, which is scheduled around ${nextPlace.visitTime || nextPlace.time || 'soon'}.`,
        recommendedPlace: nextPlace.name,
        coordinates: [nextPlace.latitude || nextPlace.coordinates?.[0], nextPlace.longitude || nextPlace.coordinates?.[1]],
        reason: `This is the next scheduled stop on your day's itinerary, matching your ${context.preferences?.travelStyle || 'general'} style.`,
      }
    }

    return {
      reply: "It looks like you've completed all scheduled spots for today! How about checking out a nearby local cafe to relax?",
      recommendedPlace: "Local Cafe",
      coordinates: [context.latitude + 0.002, context.longitude + 0.002],
      reason: "Perfect place to unwind and reflect on today's travel experiences.",
    }
  }
}
