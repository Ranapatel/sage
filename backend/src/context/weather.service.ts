/**
 * Weather Intelligence — Phase 5 of the Contextual Intelligence Layer plan.
 *
 * Wraps the WeatherAdapter + ContextObject.weather to produce per-day
 * recommendations (indoor/outdoor, packing, attire). Falls back gracefully
 * when live weather data is unavailable.
 */

import type { ContextObject } from './context.types'
import type { ModuleHandler } from './recommendation.service'

export const recommendWeather: ModuleHandler = async (input: any, ctx: ContextObject) => {
  const weather = ctx.liveData?.weather
  const trip = ctx.trip
  const destination = trip?.destination ?? 'your destination'

  if (!weather?.available) {
    return [
      {
        type: 'WeatherBriefing',
        scores: {
          aiConfidenceScore: 30,
          safetyScore: 60,
          convenienceScore: 60,
        },
        data: {
          available: false,
          summary: `Live weather for ${destination} is unavailable. Check conditions 48 hours before departure.`,
          advice: [
            'Pack layers — temperature swings are common at this stage.',
            'Carry a foldable umbrella as a precaution.',
          ],
        },
        aiConfidence: 30,
      },
    ]
  }

  const dailyForecast = weather.dailyForecast ?? []
  const tempC = weather.currentTempC

  // Build simple heuristic advice.
  const advice: string[] = []
  if (typeof tempC === 'number') {
    if (tempC < 10) advice.push('Pack warm layers — temperatures look cold.')
    else if (tempC > 30) advice.push('Light cottons & sun protection recommended.')
    else if (tempC > 20) advice.push('Light layers with a light jacket for evenings.')
    else advice.push('Mild weather — pack light layers.')
  }

  // Look for rain / storm terms in the forecast.
  const rainyDays = dailyForecast.filter((d) => /rain|shower|storm/i.test(d.conditions ?? '')).length
  if (rainyDays > 0) {
    advice.push(`Expect rain on ${rainyDays} day(s). Pack a waterproof jacket.`)
    advice.push('Plan 1–2 indoor backup activities per rainy day.')
  }

  return [
    {
      type: 'WeatherBriefing',
      scores: {
        aiConfidenceScore: 80,
        safetyScore: 75,
        convenienceScore: 80,
      },
      data: {
        available: true,
        summary: weather.forecastSummary ?? (typeof tempC === 'number' ? `Currently ${tempC}°C` : 'Weather data is loaded.'),
        currentTempC: tempC,
        dailyForecast,
        advice,
        destination,
      },
      aiConfidence: 80,
    },
  ]
}