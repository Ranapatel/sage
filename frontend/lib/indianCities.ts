/**
 * Client-side Indian location detection utility.
 * Used to determine if the Train tab should be visible before any API calls.
 */

// Comprehensive set of Indian cities, tourist destinations, and common search terms
const INDIAN_LOCATIONS: Set<string> = new Set([
  // Major metros
  'delhi', 'new delhi', 'mumbai', 'bombay', 'bangalore', 'bengaluru',
  'chennai', 'madras', 'kolkata', 'calcutta', 'hyderabad', 'secunderabad',

  // Tier-1 cities
  'pune', 'jaipur', 'agra', 'lucknow', 'ahmedabad', 'nagpur', 'bhopal',
  'patna', 'indore', 'surat', 'chandigarh', 'varanasi', 'banaras', 'kashi',
  'kanpur', 'coimbatore', 'trivandrum', 'thiruvananthapuram', 'kochi',
  'ernakulam', 'visakhapatnam', 'vizag', 'vijayawada', 'madurai',
  'mysuru', 'mysore', 'jodhpur', 'udaipur', 'amritsar', 'dehradun',
  'haridwar', 'guwahati', 'ranchi', 'bhubaneswar', 'raipur', 'jammu',
  'gwalior', 'allahabad', 'prayagraj', 'tirupati', 'mangalore', 'mangaluru',
  'shimla', 'kalka',

  // Goa
  'goa', 'madgaon', 'margao', 'vasco', 'panaji', 'panjim', 'calangute',
  'baga', 'anjuna', 'palolem',

  // Tourist destinations / non-station places
  'gokarna', 'pondicherry', 'puducherry', 'kovalam', 'alibaug', 'tarkarli',
  'ooty', 'munnar', 'kodaikanal', 'coorg', 'manali', 'darjeeling',
  'gangtok', 'shillong', 'mussoorie', 'nainital', 'mcleodganj', 'dharamshala',
  'kasol', 'leh', 'ladakh',
  'hampi', 'khajuraho', 'ajanta', 'ellora', 'rishikesh', 'rameswaram',
  'pushkar', 'bodh gaya',
  'ranthambore', 'kaziranga', 'jim corbett', 'corbett',
  'alleppey', 'alappuzha', 'kumarakom', 'thekkady', 'wayanad',
  'jaisalmer', 'mount abu',

  // Additional well-known Indian places
  'srinagar', 'kashmir', 'andaman', 'lakshadweep', 'rishikesh',
  'varanasi', 'mathura', 'vrindavan', 'dwarka', 'somnath',
  'ajmer', 'bikaner', 'kota', 'bharatpur', 'chittorgarh',
  'mahabaleshwar', 'lonavala', 'shirdi', 'nasik', 'nashik',
  'aurangabad', 'kolhapur', 'sangli',
  'hubli', 'dharwad', 'belgaum', 'gulbarga',
  'thanjavur', 'trichy', 'tiruchirappalli', 'salem', 'vellore',
  'ootacamund', 'nilgiris', 'yercaud', 'coonoor',
  'thrissur', 'kozhikode', 'calicut', 'kannur', 'palakkad',
  'meghalaya', 'assam', 'manipur', 'mizoram', 'tripura', 'nagaland',
  'arunachal', 'sikkim',
  'dehradun', 'almora', 'ranikhet', 'dalhousie', 'kullu',
  'amritsar', 'ludhiana', 'jalandhar', 'pathankot',
  'noida', 'gurgaon', 'gurugram', 'faridabad', 'ghaziabad',
  'navi mumbai', 'thane',
])

/**
 * Check if a location string refers to an Indian location.
 * Handles formats like "Hyderabad, India", "Goa", "Mumbai, Maharashtra, India".
 */
export function isIndianLocation(place: string): boolean {
  if (!place || place.trim().length === 0) return false

  const lower = place.toLowerCase().trim()

  // Fast check: if the string contains "india" it's Indian
  if (lower.includes('india')) return true

  // Strip common suffixes for matching
  const normalized = lower
    .replace(/,\s*india$/i, '')
    .replace(/,\s*[a-z\s]+$/i, '') // remove state/region suffixes like ", Maharashtra"
    .trim()

  // Check against the known set
  if (INDIAN_LOCATIONS.has(normalized)) return true

  // Partial match: check if the first word matches (handles "Hyderabad City" etc.)
  const firstWord = normalized.split(/[,\s]+/)[0]
  if (firstWord.length >= 3 && INDIAN_LOCATIONS.has(firstWord)) return true

  return false
}

/**
 * Returns true only if BOTH departure and destination are Indian locations.
 * The Train tab should be visible only when this returns true.
 */
export function isIndianTrip(from: string, to: string): boolean {
  return isIndianLocation(from) && isIndianLocation(to)
}
