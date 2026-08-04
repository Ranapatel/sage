/**
 * Solar Time Service — TripSage AI Engine
 *
 * Computes sunrise, sunset, and golden hour photo windows for any given lat/lng and date.
 * Used by candidate ranking and itinerary scheduling to align viewpoints and photography spots.
 */

export interface SolarTimes {
  sunrise: string // HH:MM (24h)
  sunset: string  // HH:MM (24h)
  goldenHourMorning: { start: string; end: string }
  goldenHourEvening: { start: string; end: string }
}

export class SolarTimeService {
  /**
   * Calculates solar times for a location and date using astronomical geometry formulas.
   */
  static calculateSolarTimes(latitude: number, longitude: number, dateStr?: string): SolarTimes {
    const date = dateStr ? new Date(dateStr) : new Date()
    const dayOfYear = this.getDayOfYear(date)

    // Fractional year in radians
    const gamma = (2 * Math.PI / 365) * (dayOfYear - 1 + (date.getHours() - 12) / 24)

    // Equation of time in minutes
    const eqtime = 229.18 * (
      0.000075 +
      0.001868 * Math.cos(gamma) -
      0.032077 * Math.sin(gamma) -
      0.014615 * Math.cos(2 * gamma) -
      0.040849 * Math.sin(2 * gamma)
    )

    // Solar declination angle in radians
    const decl = 0.006918 -
      0.399912 * Math.cos(gamma) +
      0.070257 * Math.sin(gamma) -
      0.006758 * Math.cos(2 * gamma) +
      0.000907 * Math.sin(2 * gamma) -
      0.002697 * Math.cos(3 * gamma) +
      0.00148 * Math.sin(3 * gamma)

    // Hour angle for sunrise/sunset (solar zenith = 90.833 deg)
    const latRad = latitude * (Math.PI / 180)
    const zenith = 90.833 * (Math.PI / 180)

    const cosHA = (Math.cos(zenith) / (Math.cos(latRad) * Math.cos(decl))) - (Math.tan(latRad) * Math.tan(decl))
    
    // Clamp for polar regions
    const clampedCosHA = Math.max(-1, Math.min(1, cosHA))
    const haDegrees = Math.acos(clampedCosHA) * (180 / Math.PI)

    // UTC minutes for sunrise and sunset
    const sunriseUTC = 720 - (4 * (longitude + haDegrees)) - eqtime
    const sunsetUTC = 720 - (4 * (longitude - haDegrees)) - eqtime

    // Estimate timezone offset from longitude (~15 deg per hour)
    const tzOffsetMinutes = Math.round(longitude / 15) * 60

    const sunriseLocal = (sunriseUTC + tzOffsetMinutes + 1440) % 1440
    const sunsetLocal = (sunsetUTC + tzOffsetMinutes + 1440) % 1440

    const sunriseFormatted = this.minutesToTimeString(sunriseLocal)
    const sunsetFormatted = this.minutesToTimeString(sunsetLocal)

    return {
      sunrise: sunriseFormatted,
      sunset: sunsetFormatted,
      goldenHourMorning: {
        start: this.minutesToTimeString(Math.max(0, sunriseLocal - 15)),
        end: this.minutesToTimeString(Math.min(1439, sunriseLocal + 45)),
      },
      goldenHourEvening: {
        start: this.minutesToTimeString(Math.max(0, sunsetLocal - 45)),
        end: this.minutesToTimeString(Math.min(1439, sunsetLocal + 15)),
      },
    }
  }

  /**
   * Returns a recommendation score (0.0 to 1.0) indicating how well a visit time aligns with solar preferences.
   */
  static evaluateSolarFit(
    timeStr: string,
    preference: 'sunrise' | 'sunset' | 'golden_hour' | 'none',
    solar: SolarTimes
  ): number {
    if (preference === 'none') return 0.7

    const visitMinutes = this.timeStringToMinutes(timeStr)
    const sunsetMinutes = this.timeStringToMinutes(solar.sunset)
    const sunriseMinutes = this.timeStringToMinutes(solar.sunrise)

    if (preference === 'sunset') {
      const diff = Math.abs(visitMinutes - sunsetMinutes)
      return diff <= 45 ? 1.0 : diff <= 90 ? 0.7 : 0.4
    }

    if (preference === 'sunrise') {
      const diff = Math.abs(visitMinutes - sunriseMinutes)
      return diff <= 45 ? 1.0 : diff <= 90 ? 0.7 : 0.4
    }

    if (preference === 'golden_hour') {
      const mDiff = Math.abs(visitMinutes - sunriseMinutes)
      const eDiff = Math.abs(visitMinutes - sunsetMinutes)
      const minDiff = Math.min(mDiff, eDiff)
      return minDiff <= 30 ? 1.0 : minDiff <= 60 ? 0.8 : 0.5
    }

    return 0.7
  }

  private static getDayOfYear(date: Date): number {
    const start = new Date(date.getFullYear(), 0, 0)
    const diff = date.getTime() - start.getTime()
    const oneDay = 1000 * 60 * 60 * 24
    return Math.floor(diff / oneDay)
  }

  private static minutesToTimeString(minutes: number): string {
    const hrs = Math.floor(minutes / 60)
    const mins = Math.floor(minutes % 60)
    const hh = String(hrs).padStart(2, '0')
    const mm = String(mins).padStart(2, '0')
    return `${hh}:${mm}`
  }

  private static timeStringToMinutes(timeStr: string): number {
    const parts = timeStr.split(':')
    const hrs = parseInt(parts[0], 10) || 0
    const mins = parseInt(parts[1], 10) || 0
    return hrs * 60 + mins
  }
}
