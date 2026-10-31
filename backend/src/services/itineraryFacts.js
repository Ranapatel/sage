/**
 * Calendar dates and trip-cost invariants for generated itineraries.
 *
 * Dates are YYYY-MM-DD calendar days. They are not parsed with `new Date(iso)`,
 * which treats a date-only string as UTC midnight and can shift the day in
 * timezones behind UTC. Costs are rewritten so the published total equals the
 * sum of the breakdown lines.
 */

/**
 * City used in itinerary cache keys. "Delhi, India" and "delhi" share a key.
 * An empty origin stays empty so it does not match a named city.
 */
function originCity(from) {
  return String(from || '').split(',')[0].trim().toLowerCase()
}

function money(value) {
  const n = Number(value)
  if (!Number.isFinite(n)) return 0
  return Math.max(0, Math.round(n))
}

function parseCalendarDate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(value || '').trim())
  if (!match) return null
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  if (month < 1 || month > 12 || day < 1 || day > 31) return null
  return { year, month, day }
}

function formatUtcDate(year, month, day) {
  const dt = new Date(Date.UTC(year, month - 1, day))
  const yyyy = dt.getUTCFullYear()
  const mm = String(dt.getUTCMonth() + 1).padStart(2, '0')
  const dd = String(dt.getUTCDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

/**
 * Day 1 is startDate. Later days are the next calendar dates.
 * Missing or invalid startDate falls back to today's calendar date in UTC,
 * which is only used when the caller did not send a date.
 */
function dateForDay(startDate, dayNumber) {
  const day = Number(dayNumber)
  const offset = Number.isFinite(day) && day >= 1 ? day - 1 : 0
  const parsed = parseCalendarDate(startDate)
  if (!parsed) {
    const now = new Date()
    return formatUtcDate(now.getUTCFullYear(), now.getUTCMonth() + 1, now.getUTCDate() + offset)
  }
  return formatUtcDate(parsed.year, parsed.month, parsed.day + offset)
}

function slotItems(day) {
  if (Array.isArray(day?.places) && day.places.length > 0) return day.places
  const slots = day?.slots || {}
  return [slots.morning, slots.afternoon, slots.evening, slots.night].filter(Boolean)
}

function sumActivityCosts(itinerary) {
  let sum = 0
  for (const day of itinerary || []) {
    for (const item of slotItems(day)) {
      sum += money(item?.estimatedCost)
    }
  }
  return sum
}

function stampItineraryDates(data, startDate) {
  if (!data || !Array.isArray(data.itinerary)) return data
  return {
    ...data,
    itinerary: data.itinerary.map((day, index) => {
      const dayNumber = Number(day?.day) >= 1 ? Number(day.day) : index + 1
      return {
        ...day,
        day: dayNumber,
        date: dateForDay(startDate, dayNumber),
      }
    }),
  }
}

/**
 * totalEstimatedCost is always flights + hotels + food + activities.
 * Activity costs follow the stops. Hotels and food fill the rest of the
 * budget when the model left them blank, and are reduced before activities
 * when the lines would otherwise exceed the budget.
 */
function reconcileTripCost(data, params = {}) {
  if (!data) return data
  const budget = money(params.budget)
  const bb = data.budgetBreakdown || {}
  const activitySum = sumActivityCosts(data.itinerary)
  let flights = money(bb.flightsEstimate != null ? bb.flightsEstimate : bb.transportEstimate)
  let hotels = money(bb.hotelsEstimate)
  let food = money(bb.foodEstimate)
  let activities = activitySum > 0 ? activitySum : money(bb.activitiesEstimate)

  if (hotels === 0 && food === 0 && budget > activities + flights) {
    const rest = budget - activities - flights
    hotels = Math.floor(rest * 0.6)
    food = rest - hotels
  }

  let total = flights + hotels + food + activities
  if (budget > 0 && total > budget) {
    let over = total - budget
    const cutHotels = Math.min(hotels, over)
    hotels -= cutHotels
    over -= cutHotels
    const cutFood = Math.min(food, over)
    food -= cutFood
    over -= cutFood
    const cutFlights = Math.min(flights, over)
    flights -= cutFlights
  }

  total = flights + hotels + food + activities
  return {
    ...data,
    totalEstimatedCost: total,
    budgetBreakdown: {
      flightsEstimate: flights,
      hotelsEstimate: hotels,
      foodEstimate: food,
      activitiesEstimate: activities,
      remainingBudget: budget - total,
    },
  }
}

module.exports = {
  originCity,
  dateForDay,
  stampItineraryDates,
  reconcileTripCost,
  sumActivityCosts,
}
