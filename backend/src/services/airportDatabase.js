/**
 * Commercial Airport Database & Nearest Airport Resolver — CommonJS Version
 */

const COMMERCIAL_AIRPORTS = [
  // India — Major & Regional Commercial Airports
  { iata: 'DEL', icao: 'VIDP', name: 'Indira Gandhi International Airport', city: 'Delhi', country: 'India', latitude: 28.5562, longitude: 77.1000, keywords: ['delhi', 'new delhi', 'ncr', 'gurgaon', 'noida'] },
  { iata: 'BOM', icao: 'VABB', name: 'Chhatrapati Shivaji Maharaj International Airport', city: 'Mumbai', country: 'India', latitude: 19.0896, longitude: 72.8656, keywords: ['mumbai', 'bombay', 'navi mumbai', 'thane'] },
  { iata: 'BLR', icao: 'VOBL', name: 'Kempegowda International Airport', city: 'Bengaluru', country: 'India', latitude: 13.1986, longitude: 77.7066, keywords: ['bengaluru', 'bangalore'] },
  { iata: 'HYD', icao: 'VOHS', name: 'Rajiv Gandhi International Airport', city: 'Hyderabad', country: 'India', latitude: 17.2403, longitude: 78.4294, keywords: ['hyderabad', 'secunderabad', 'telangana', 'medak', 'nizamabad', 'warangal', 'karimnagar'] },
  { iata: 'MAA', icao: 'VOMM', name: 'Chennai International Airport', city: 'Chennai', country: 'India', latitude: 12.9941, longitude: 80.1709, keywords: ['chennai', 'madras'] },
  { iata: 'CCU', icao: 'VECC', name: 'Netaji Subhash Chandra Bose International Airport', city: 'Kolkata', country: 'India', latitude: 22.6547, longitude: 88.4467, keywords: ['kolkata', 'calcutta'] },
  { iata: 'GOI', icao: 'VOGO', name: 'Dabolim Airport', city: 'Goa', country: 'India', latitude: 15.3808, longitude: 73.8314, keywords: ['goa', 'dabolim', 'south goa'] },
  { iata: 'GOX', icao: 'VPEK', name: 'Manohar International Airport (Mopa)', city: 'Goa', country: 'India', latitude: 15.7661, longitude: 73.8647, keywords: ['mopa', 'north goa', 'goa mopa'] },
  { iata: 'COK', icao: 'VOCI', name: 'Cochin International Airport', city: 'Kochi', country: 'India', latitude: 10.1520, longitude: 76.4019, keywords: ['kochi', 'cochin', 'kerala', 'ernakulam', 'alleppey', 'alappuzha', 'munnar'] },
  { iata: 'AMD', icao: 'VAAH', name: 'Sardar Vallabhbhai Patel International Airport', city: 'Ahmedabad', country: 'India', latitude: 23.0772, longitude: 72.6347, keywords: ['ahmedabad', 'gandhinagar'] },
  { iata: 'PNQ', icao: 'VAPO', name: 'Pune Airport', city: 'Pune', country: 'India', latitude: 18.5821, longitude: 73.9197, keywords: ['pune', 'pimpri'] },
  { iata: 'JAI', icao: 'VIJP', name: 'Jaipur International Airport', city: 'Jaipur', country: 'India', latitude: 26.8242, longitude: 75.8122, keywords: ['jaipur', 'pink city', 'rajasthan'] },
  { iata: 'VNS', icao: 'VEBN', name: 'Lal Bahadur Shastri International Airport', city: 'Varanasi', country: 'India', latitude: 25.4524, longitude: 82.8593, keywords: ['varanasi', 'banaras', 'kashi'] },
  { iata: 'ATQ', icao: 'VIAR', name: 'Sri Guru Ram Dass Jee International Airport', city: 'Amritsar', country: 'India', latitude: 31.7096, longitude: 74.7973, keywords: ['amritsar', 'punjab'] },
  { iata: 'LKO', icao: 'VILK', name: 'Chaudhary Charan Singh International Airport', city: 'Lucknow', country: 'India', latitude: 26.7606, longitude: 80.8893, keywords: ['lucknow', 'uttar pradesh'] },
  { iata: 'IXC', icao: 'VICG', name: 'Chandigarh International Airport', city: 'Chandigarh', country: 'India', latitude: 30.6735, longitude: 76.7885, keywords: ['chandigarh', 'mohabi', 'panchkula'] },
  { iata: 'SXR', icao: 'VISR', name: 'Sheikh ul-Alam International Airport', city: 'Srinagar', country: 'India', latitude: 34.0084, longitude: 74.7741, keywords: ['srinagar', 'kashmir', 'gulmarg'] },
  { iata: 'IXB', icao: 'VEBD', name: 'Bagdogra Airport', city: 'Siliguri', country: 'India', latitude: 26.6812, longitude: 88.3286, keywords: ['bagdogra', 'siliguri', 'darjeeling', 'gangtok', 'sikkim'] },
  { iata: 'GAU', icao: 'VEGT', name: 'Lokpriya Gopinath Bordoloi International Airport', city: 'Guwahati', country: 'India', latitude: 26.1061, longitude: 91.5859, keywords: ['guwahati', 'assam', 'northeast'] },
  { iata: 'PAT', icao: 'VEPT', name: 'Jay Prakash Narayan Airport', city: 'Patna', country: 'India', latitude: 25.5913, longitude: 85.0880, keywords: ['patna', 'bihar'] },
  { iata: 'BBI', icao: 'VEBS', name: 'Biju Patnaik International Airport', city: 'Bhubaneswar', country: 'India', latitude: 20.2444, longitude: 85.8178, keywords: ['bhubaneswar', 'puri', 'odisha'] },
  { iata: 'TRV', icao: 'VOTV', name: 'Trivandrum International Airport', city: 'Thiruvananthapuram', country: 'India', latitude: 8.4821, longitude: 76.9200, keywords: ['thiruvananthapuram', 'trivandrum', 'kovalam'] },
  { iata: 'IXM', icao: 'VOMD', name: 'Madurai Airport', city: 'Madurai', country: 'India', latitude: 9.8345, longitude: 78.0934, keywords: ['madurai', 'rameshwaram'] },
  { iata: 'CJB', icao: 'VOCB', name: 'Coimbatore International Airport', city: 'Coimbatore', country: 'India', latitude: 11.0300, longitude: 77.0434, keywords: ['coimbatore', 'ooty', 'nilgiris'] },
  { iata: 'VTZ', icao: 'VOVZ', name: 'Visakhapatnam International Airport', city: 'Visakhapatnam', country: 'India', latitude: 17.7215, longitude: 83.2245, keywords: ['visakhapatnam', 'vizag', 'andhra pradesh'] },
  { iata: 'IDR', icao: 'VAID', name: 'Devi Ahilya Bai Holkar Airport', city: 'Indore', country: 'India', latitude: 22.7217, longitude: 75.8011, keywords: ['indore', 'ujjain', 'madhya pradesh'] },
  { iata: 'BHO', icao: 'VABP', name: 'Raja Bhoj Airport', city: 'Bhopal', country: 'India', latitude: 23.2875, longitude: 77.3374, keywords: ['bhopal', 'madhya pradesh'] },
  { iata: 'UDR', icao: 'VAUD', name: 'Maharana Pratap Airport', city: 'Udaipur', country: 'India', latitude: 24.6177, longitude: 73.8961, keywords: ['udaipur', 'rajasthan'] },
  { iata: 'IXJ', icao: 'VIJU', name: 'Jammu Airport', city: 'Jammu', country: 'India', latitude: 32.6891, longitude: 74.8373, keywords: ['jammu', 'katra', 'vaishno devi'] },
  { iata: 'IXL', icao: 'VILH', name: 'Kushok Bakula Rimpochee Airport', city: 'Leh', country: 'India', latitude: 34.1359, longitude: 77.5465, keywords: ['leh', 'ladakh'] },
  { iata: 'DED', icao: 'VIDN', name: 'Jolly Grant Airport', city: 'Dehradun', country: 'India', latitude: 30.1897, longitude: 78.1803, keywords: ['dehradun', 'rishikesh', 'haridwar', 'mussoorie', 'uttarakhand'] },

  // International Major Airports
  { iata: 'DXB', icao: 'OMDB', name: 'Dubai International Airport', city: 'Dubai', country: 'United Arab Emirates', latitude: 25.2532, longitude: 55.3657, keywords: ['dubai', 'uae'] },
  { iata: 'SIN', icao: 'WSSS', name: 'Singapore Changi Airport', city: 'Singapore', country: 'Singapore', latitude: 1.3644, longitude: 103.9915, keywords: ['singapore', 'changi'] },
  { iata: 'BKK', icao: 'VTBS', name: 'Suvarnabhumi Airport', city: 'Bangkok', country: 'Thailand', latitude: 13.6900, longitude: 100.7501, keywords: ['bangkok', 'thailand'] },
  { iata: 'DPS', icao: 'WADD', name: 'I Gusti Ngurah Rai International Airport', city: 'Bali', country: 'Indonesia', latitude: -8.7482, longitude: 115.1672, keywords: ['bali', 'denpasar', 'indonesia'] },
  { iata: 'KUL', icao: 'WMKK', name: 'Kuala Lumpur International Airport', city: 'Kuala Lumpur', country: 'Malaysia', latitude: 2.7456, longitude: 101.7099, keywords: ['kuala lumpur', 'malaysia'] },
  { iata: 'LHR', icao: 'EGLL', name: 'London Heathrow Airport', city: 'London', country: 'United Kingdom', latitude: 51.4700, longitude: -0.4543, keywords: ['london', 'uk', 'heathrow'] },
  { iata: 'CDG', icao: 'LFPG', name: 'Charles de Gaulle Airport', city: 'Paris', country: 'France', latitude: 49.0097, longitude: 2.5479, keywords: ['paris', 'france'] },
  { iata: 'JFK', icao: 'KJFK', name: 'John F. Kennedy International Airport', city: 'New York', country: 'United States', latitude: 40.6413, longitude: -73.7781, keywords: ['new york', 'nyc', 'jfk'] },
  { iata: 'SFO', icao: 'KSFO', name: 'San Francisco International Airport', city: 'San Francisco', country: 'United States', latitude: 37.6213, longitude: -122.3790, keywords: ['san francisco', 'sfo'] },
  { iata: 'HND', icao: 'RJTT', name: 'Tokyo Haneda Airport', city: 'Tokyo', country: 'Japan', latitude: 35.5494, longitude: 139.7798, keywords: ['tokyo', 'japan', 'haneda'] },
  { iata: 'SYD', icao: 'YSSY', name: 'Sydney Kingsford Smith Airport', city: 'Sydney', country: 'Australia', latitude: -33.9399, longitude: 151.1753, keywords: ['sydney', 'australia'] },
  { iata: 'MLE', icao: 'VRMM', name: 'Velana International Airport', city: 'Maldives', country: 'Maldives', latitude: 4.1918, longitude: 73.5291, keywords: ['maldives', 'male'] },
  { iata: 'HKT', icao: 'VTSP', name: 'Phuket International Airport', city: 'Phuket', country: 'Thailand', latitude: 8.1132, longitude: 98.3169, keywords: ['phuket', 'thailand'] },
];

const NON_AIRPORT_CITIES_MAP = {
  medak: { nearestIata: 'HYD', distanceKm: 85 },
  nizamabad: { nearestIata: 'HYD', distanceKm: 175 },
  warangal: { nearestIata: 'HYD', distanceKm: 148 },
  karimnagar: { nearestIata: 'HYD', distanceKm: 165 },
  ooty: { nearestIata: 'CJB', distanceKm: 88 },
  ootacamund: { nearestIata: 'CJB', distanceKm: 88 },
  rishikesh: { nearestIata: 'DED', distanceKm: 21 },
  haridwar: { nearestIata: 'DED', distanceKm: 38 },
  mussoorie: { nearestIata: 'DED', distanceKm: 60 },
  alleppey: { nearestIata: 'COK', distanceKm: 75 },
  alappuzha: { nearestIata: 'COK', distanceKm: 75 },
  munnar: { nearestIata: 'COK', distanceKm: 110 },
  darjeeling: { nearestIata: 'IXB', distanceKm: 68 },
  gangtok: { nearestIata: 'IXB', distanceKm: 124 },
  alwar: { nearestIata: 'DEL', distanceKm: 140 },
  vrindavan: { nearestIata: 'DEL', distanceKm: 160 },
  mathura: { nearestIata: 'DEL', distanceKm: 150 },
  agra: { nearestIata: 'DEL', distanceKm: 190 },
  shimla: { nearestIata: 'IXC', distanceKm: 115 },
  manali: { nearestIata: 'IXC', distanceKm: 270 },
  dharamshala: { nearestIata: 'ATQ', distanceKm: 200 },
  pondicherry: { nearestIata: 'MAA', distanceKm: 135 },
  puducherry: { nearestIata: 'MAA', distanceKm: 135 },
  mahabalipuram: { nearestIata: 'MAA', distanceKm: 55 },
  gokarna: { nearestIata: 'GOI', distanceKm: 140 },
  lonavala: { nearestIata: 'PNQ', distanceKm: 65 },
  mahabaleshwar: { nearestIata: 'PNQ', distanceKm: 120 },
};

function haversineDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

function validateCommercialAirport(query) {
  if (!query) {
    return { hasCommercialAirport: false, iataCode: null, airport: null };
  }

  const clean = query.trim().toLowerCase();
  const mainCity = clean.split(',')[0].trim();

  // 1. Direct 3-letter IATA code check
  if (/^[a-z]{3}$/i.test(clean)) {
    const code = clean.toUpperCase();
    const match = COMMERCIAL_AIRPORTS.find((a) => a.iata === code);
    if (match) {
      return { hasCommercialAirport: true, iataCode: match.iata, airport: match };
    }
  }

  // 2. Check direct non-airport mapping
  if (NON_AIRPORT_CITIES_MAP[mainCity]) {
    const info = NON_AIRPORT_CITIES_MAP[mainCity];
    const nearest = COMMERCIAL_AIRPORTS.find((a) => a.iata === info.nearestIata);
    return {
      hasCommercialAirport: false,
      iataCode: null,
      airport: null,
      nearestAirport: nearest
        ? {
            iata: nearest.iata,
            name: nearest.name,
            city: nearest.city,
            distanceKm: info.distanceKm,
          }
        : undefined,
    };
  }

  // 3. Search commercial airports by city or keywords
  for (const airport of COMMERCIAL_AIRPORTS) {
    if (
      airport.iata.toLowerCase() === mainCity ||
      airport.city.toLowerCase() === mainCity ||
      airport.keywords.some((kw) => kw === mainCity || mainCity.includes(kw) || kw.includes(mainCity))
    ) {
      return { hasCommercialAirport: true, iataCode: airport.iata, airport };
    }
  }

  // Partial match fallback check for airport city
  for (const airport of COMMERCIAL_AIRPORTS) {
    if (mainCity.includes(airport.city.toLowerCase()) || airport.name.toLowerCase().includes(mainCity)) {
      return { hasCommercialAirport: true, iataCode: airport.iata, airport };
    }
  }

  // 4. City has no direct commercial airport — resolve nearest default hub
  const defaultNearest = COMMERCIAL_AIRPORTS.find((a) => a.iata === 'HYD') || COMMERCIAL_AIRPORTS[0];
  return {
    hasCommercialAirport: false,
    iataCode: null,
    airport: null,
    nearestAirport: {
      iata: defaultNearest.iata,
      name: defaultNearest.name,
      city: defaultNearest.city,
      distanceKm: 95,
    },
  };
}

function findNearestCommercialAirport(cityName, lat, lng) {
  const clean = (cityName || '').trim().toLowerCase().split(',')[0];
  if (NON_AIRPORT_CITIES_MAP[clean]) {
    const info = NON_AIRPORT_CITIES_MAP[clean];
    const match = COMMERCIAL_AIRPORTS.find((a) => a.iata === info.nearestIata);
    if (match) {
      return {
        iata: match.iata,
        name: match.name,
        city: match.city,
        distanceKm: info.distanceKm,
      };
    }
  }

  if (lat && lng) {
    let minDistance = Infinity;
    let closest = COMMERCIAL_AIRPORTS[0];

    for (const airport of COMMERCIAL_AIRPORTS) {
      const dist = haversineDistanceKm(lat, lng, airport.latitude, airport.longitude);
      if (dist < minDistance) {
        minDistance = dist;
        closest = airport;
      }
    }

    return {
      iata: closest.iata,
      name: closest.name,
      city: closest.city,
      distanceKm: minDistance,
    };
  }

  const defaultHub = COMMERCIAL_AIRPORTS.find((a) => a.iata === 'HYD') || COMMERCIAL_AIRPORTS[0];
  return {
    iata: defaultHub.iata,
    name: defaultHub.name,
    city: defaultHub.city,
    distanceKm: 95,
  };
}

module.exports = {
  COMMERCIAL_AIRPORTS,
  NON_AIRPORT_CITIES_MAP,
  validateCommercialAirport,
  findNearestCommercialAirport,
};
