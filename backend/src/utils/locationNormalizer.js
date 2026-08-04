/**
 * TripSage — Location Normalizer
 *
 * Pure function that transforms a raw Geoapify geocoding feature
 * into the internal normalized Location interface.
 *
 * Design notes:
 * - Handles edge cases: city-states (Singapore), territories, regions
 * - Falls back gracefully when fields are absent
 * - No side effects, no I/O — safe to call from anywhere
 */

/**
 * Normalize a Geoapify feature into the internal Location format.
 *
 * @param feature - A single Geoapify geocoding result feature
 * @param originalQuery - The user's original search string (used as fallback name)
 * @returns A normalized Location object
 */
function normalizeGeoapifyFeature(feature, originalQuery) {
  const props = feature.properties

  // ── Derive display name ──────────────────────────────────────────────────
  // Priority: explicit name → city → municipality → county → state → original query
  const name = props.name
    || props.city
    || props.municipality
    || props.county
    || props.state
    || capitalizeQuery(originalQuery)

  // ── Derive city ──────────────────────────────────────────────────────────
  // For city-states like Singapore, Monaco — city may be absent. Use name.
  const city = props.city
    || props.municipality
    || props.name
    || capitalizeQuery(originalQuery)

  // ── State / province ─────────────────────────────────────────────────────
  const state = props.state || ''

  // ── Country ──────────────────────────────────────────────────────────────
  const country = props.country || ''
  const countryCode = (props.country_code || '').toUpperCase()

  // ── Coordinates ──────────────────────────────────────────────────────────
  // Geoapify provides coords both in properties AND geometry.coordinates
  // Properties take precedence (they're the pin location vs. bbox center)
  const latitude = props.lat !== undefined ? props.lat : feature.geometry.coordinates[1]
  const longitude = props.lon !== undefined ? props.lon : feature.geometry.coordinates[0]

  // ── Formatted address ────────────────────────────────────────────────────
  const formattedAddress = props.formatted || buildFallbackAddress(name, state, country)

  // ── Place ID ─────────────────────────────────────────────────────────────
  const placeId = props.place_id || ''

  return {
    name,
    city,
    state,
    country,
    countryCode,
    latitude,
    longitude,
    formattedAddress,
    placeId,
  }
}

/**
 * Build a fallback formatted address from component parts
 * when Geoapify doesn't provide a `formatted` field.
 */
function buildFallbackAddress(name, state, country) {
  return [name, state, country].filter(Boolean).join(', ')
}

/**
 * Capitalize the first letter of each word in a query string.
 * Used as a last-resort display name when Geoapify fields are empty.
 */
function capitalizeQuery(query) {
  return query
    .trim()
    .split(/\s+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

module.exports = { normalizeGeoapifyFeature }
module.exports.normalizeGeoapifyFeature = normalizeGeoapifyFeature
