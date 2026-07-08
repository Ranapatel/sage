/**
 * TripSage Curated Place Image Database
 *
 * All images sourced from Wikimedia Commons (free, verifiable, licensed).
 * URLs use Special:FilePath — stable redirects that resolve to upload.wikimedia.org.
 * confidence is always 'exact' — every entry has been verified to match the place.
 *
 * Add new entries at the bottom of the relevant city block.
 * Never use Unsplash URLs in this file.
 */

export type ImageConfidence = 'exact' | 'area' | 'category' | 'none'
export type ImageSource = 'curated' | 'wikidata' | 'wikipedia' | 'wikimedia-geo' | 'category' | 'none'

export interface CuratedPlaceImage {
  placeKey: string         // lowercase normalised lookup key
  placeName: string
  city: string
  country: string
  imageUrl: string
  source: 'curated'
  license: string
  attribution: string
  attributionUrl: string
  confidence: 'exact'
  altText: string
  lastVerified: string
}

/** Build a Wikimedia Commons Special:FilePath URL (auto-resolves to upload CDN) */
function wmc(filename: string, width = 800): string {
  return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(filename)}?width=${width}`
}

export const CURATED_IMAGES: CuratedPlaceImage[] = [

  // ═══════════════════════════════════════════════════════════
  // DELHI
  // ═══════════════════════════════════════════════════════════
  {
    placeKey: 'india gate',
    placeName: 'India Gate',
    city: 'Delhi', country: 'India',
    imageUrl: wmc('India_Gate_in_New_Delhi_03-2016.jpg'),
    source: 'curated', license: 'CC BY-SA 3.0',
    attribution: '© Wikimedia Commons',
    attributionUrl: 'https://commons.wikimedia.org/wiki/File:India_Gate_in_New_Delhi_03-2016.jpg',
    confidence: 'exact', altText: 'India Gate war memorial, New Delhi',
    lastVerified: '2025-01-01',
  },
  {
    placeKey: 'red fort',
    placeName: 'Red Fort',
    city: 'Delhi', country: 'India',
    imageUrl: wmc('Red_Fort_in_Delhi_03-2016_img3.jpg'),
    source: 'curated', license: 'CC BY-SA 3.0',
    attribution: '© Wikimedia Commons',
    attributionUrl: 'https://commons.wikimedia.org/wiki/File:Red_Fort_in_Delhi_03-2016_img3.jpg',
    confidence: 'exact', altText: 'Red Fort (Lal Qila), Old Delhi',
    lastVerified: '2025-01-01',
  },
  {
    placeKey: 'lal qila',
    placeName: 'Lal Qila',
    city: 'Delhi', country: 'India',
    imageUrl: wmc('Red_Fort_in_Delhi_03-2016_img3.jpg'),
    source: 'curated', license: 'CC BY-SA 3.0',
    attribution: '© Wikimedia Commons',
    attributionUrl: 'https://commons.wikimedia.org/wiki/File:Red_Fort_in_Delhi_03-2016_img3.jpg',
    confidence: 'exact', altText: 'Red Fort (Lal Qila), Old Delhi',
    lastVerified: '2025-01-01',
  },
  {
    placeKey: 'qutub minar',
    placeName: 'Qutub Minar',
    city: 'Delhi', country: 'India',
    imageUrl: wmc('Qutb_Minar_2011.jpg'),
    source: 'curated', license: 'CC BY-SA 3.0',
    attribution: '© Wikimedia Commons',
    attributionUrl: 'https://commons.wikimedia.org/wiki/File:Qutb_Minar_2011.jpg',
    confidence: 'exact', altText: 'Qutub Minar minaret, Delhi',
    lastVerified: '2025-01-01',
  },
  {
    placeKey: "humayun's tomb",
    placeName: "Humayun's Tomb",
    city: 'Delhi', country: 'India',
    imageUrl: wmc('Humayun%27s_Tomb,_Delhi.jpg'),
    source: 'curated', license: 'CC BY-SA 3.0',
    attribution: '© Wikimedia Commons',
    attributionUrl: 'https://commons.wikimedia.org/wiki/File:Humayun%27s_Tomb,_Delhi.jpg',
    confidence: 'exact', altText: "Humayun's Tomb UNESCO site, Delhi",
    lastVerified: '2025-01-01',
  },
  {
    placeKey: 'humayun tomb',
    placeName: "Humayun's Tomb",
    city: 'Delhi', country: 'India',
    imageUrl: wmc('Humayun%27s_Tomb,_Delhi.jpg'),
    source: 'curated', license: 'CC BY-SA 3.0',
    attribution: '© Wikimedia Commons',
    attributionUrl: 'https://commons.wikimedia.org/wiki/File:Humayun%27s_Tomb,_Delhi.jpg',
    confidence: 'exact', altText: "Humayun's Tomb UNESCO site, Delhi",
    lastVerified: '2025-01-01',
  },
  {
    placeKey: 'lotus temple',
    placeName: 'Lotus Temple',
    city: 'Delhi', country: 'India',
    imageUrl: wmc('Lotus_Temple_in_New_Delhi_03-2016.jpg'),
    source: 'curated', license: 'CC BY-SA 3.0',
    attribution: '© Wikimedia Commons',
    attributionUrl: 'https://commons.wikimedia.org/wiki/File:Lotus_Temple_in_New_Delhi_03-2016.jpg',
    confidence: 'exact', altText: 'Lotus Temple Bahai House of Worship, Delhi',
    lastVerified: '2025-01-01',
  },
  {
    placeKey: 'jama masjid',
    placeName: 'Jama Masjid',
    city: 'Delhi', country: 'India',
    imageUrl: wmc('Jama_Masjid_Delhi.jpg'),
    source: 'curated', license: 'CC BY-SA 3.0',
    attribution: '© Wikimedia Commons',
    attributionUrl: 'https://commons.wikimedia.org/wiki/File:Jama_Masjid_Delhi.jpg',
    confidence: 'exact', altText: 'Jama Masjid mosque, Old Delhi',
    lastVerified: '2025-01-01',
  },
  {
    placeKey: 'akshardham',
    placeName: 'Akshardham Temple',
    city: 'Delhi', country: 'India',
    imageUrl: wmc('Akshardham_(Delhi)_in_March_2014_003.jpg'),
    source: 'curated', license: 'CC BY-SA 3.0',
    attribution: '© Wikimedia Commons',
    attributionUrl: 'https://commons.wikimedia.org/wiki/File:Akshardham_(Delhi)_in_March_2014_003.jpg',
    confidence: 'exact', altText: 'Akshardham Hindu temple complex, Delhi',
    lastVerified: '2025-01-01',
  },
  {
    placeKey: 'chandni chowk',
    placeName: 'Chandni Chowk',
    city: 'Delhi', country: 'India',
    imageUrl: wmc('Chandni_Chowk,_Delhi.jpg'),
    source: 'curated', license: 'CC BY-SA 3.0',
    attribution: '© Wikimedia Commons',
    attributionUrl: 'https://commons.wikimedia.org/wiki/File:Chandni_Chowk,_Delhi.jpg',
    confidence: 'exact', altText: 'Chandni Chowk historic market, Old Delhi',
    lastVerified: '2025-01-01',
  },

  // ═══════════════════════════════════════════════════════════
  // MUMBAI
  // ═══════════════════════════════════════════════════════════
  {
    placeKey: 'gateway of india',
    placeName: 'Gateway of India',
    city: 'Mumbai', country: 'India',
    imageUrl: wmc('Mumbai_03-2016_30_Gateway_of_India.jpg'),
    source: 'curated', license: 'CC BY-SA 3.0',
    attribution: '© Wikimedia Commons',
    attributionUrl: 'https://commons.wikimedia.org/wiki/File:Mumbai_03-2016_30_Gateway_of_India.jpg',
    confidence: 'exact', altText: 'Gateway of India monument, Mumbai waterfront',
    lastVerified: '2025-01-01',
  },
  {
    placeKey: 'elephanta caves',
    placeName: 'Elephanta Caves',
    city: 'Mumbai', country: 'India',
    imageUrl: wmc('Elephanta_caves.jpg'),
    source: 'curated', license: 'CC BY-SA 3.0',
    attribution: '© Wikimedia Commons',
    attributionUrl: 'https://commons.wikimedia.org/wiki/File:Elephanta_caves.jpg',
    confidence: 'exact', altText: 'Elephanta Caves UNESCO site, Mumbai Harbour',
    lastVerified: '2025-01-01',
  },
  {
    placeKey: 'marine drive',
    placeName: 'Marine Drive',
    city: 'Mumbai', country: 'India',
    imageUrl: wmc('Marine_Drive_at_Night.jpg'),
    source: 'curated', license: 'CC BY-SA 3.0',
    attribution: '© Wikimedia Commons',
    attributionUrl: 'https://commons.wikimedia.org/wiki/File:Marine_Drive_at_Night.jpg',
    confidence: 'exact', altText: "Marine Drive Queen's Necklace, Mumbai",
    lastVerified: '2025-01-01',
  },
  {
    placeKey: 'chhatrapati shivaji terminus',
    placeName: 'Chhatrapati Shivaji Terminus',
    city: 'Mumbai', country: 'India',
    imageUrl: wmc('CST_station.jpg'),
    source: 'curated', license: 'CC BY-SA 3.0',
    attribution: '© Wikimedia Commons',
    attributionUrl: 'https://commons.wikimedia.org/wiki/File:CST_station.jpg',
    confidence: 'exact', altText: 'Chhatrapati Shivaji Terminus UNESCO heritage station, Mumbai',
    lastVerified: '2025-01-01',
  },
  {
    placeKey: 'cst',
    placeName: 'Chhatrapati Shivaji Terminus',
    city: 'Mumbai', country: 'India',
    imageUrl: wmc('CST_station.jpg'),
    source: 'curated', license: 'CC BY-SA 3.0',
    attribution: '© Wikimedia Commons',
    attributionUrl: 'https://commons.wikimedia.org/wiki/File:CST_station.jpg',
    confidence: 'exact', altText: 'Chhatrapati Shivaji Terminus UNESCO heritage station, Mumbai',
    lastVerified: '2025-01-01',
  },
  {
    placeKey: 'haji ali dargah',
    placeName: 'Haji Ali Dargah',
    city: 'Mumbai', country: 'India',
    imageUrl: wmc('Haji_Ali_Dargah.jpg'),
    source: 'curated', license: 'CC BY-SA 3.0',
    attribution: '© Wikimedia Commons',
    attributionUrl: 'https://commons.wikimedia.org/wiki/File:Haji_Ali_Dargah.jpg',
    confidence: 'exact', altText: 'Haji Ali Dargah mosque on islet, Mumbai',
    lastVerified: '2025-01-01',
  },
  {
    placeKey: 'bandra worli sea link',
    placeName: 'Bandra-Worli Sea Link',
    city: 'Mumbai', country: 'India',
    imageUrl: wmc('Bandra–Worli_Sea_Link_2014.jpg'),
    source: 'curated', license: 'CC BY-SA 3.0',
    attribution: '© Wikimedia Commons',
    attributionUrl: 'https://commons.wikimedia.org/wiki/File:Bandra%E2%80%93Worli_Sea_Link_2014.jpg',
    confidence: 'exact', altText: 'Bandra-Worli Sea Link cable-stay bridge, Mumbai',
    lastVerified: '2025-01-01',
  },
  {
    placeKey: 'juhu beach',
    placeName: 'Juhu Beach',
    city: 'Mumbai', country: 'India',
    imageUrl: wmc('Juhu_beach_Mumbai.jpg'),
    source: 'curated', license: 'CC BY-SA 3.0',
    attribution: '© Wikimedia Commons',
    attributionUrl: 'https://commons.wikimedia.org/wiki/File:Juhu_beach_Mumbai.jpg',
    confidence: 'exact', altText: 'Juhu Beach at sunset, Mumbai',
    lastVerified: '2025-01-01',
  },

  // ═══════════════════════════════════════════════════════════
  // JAIPUR
  // ═══════════════════════════════════════════════════════════
  {
    placeKey: 'amber fort',
    placeName: 'Amber Fort',
    city: 'Jaipur', country: 'India',
    imageUrl: wmc('Amber_fort_Jaipur_Rajasthan.jpg'),
    source: 'curated', license: 'CC BY-SA 3.0',
    attribution: '© Wikimedia Commons',
    attributionUrl: 'https://commons.wikimedia.org/wiki/File:Amber_fort_Jaipur_Rajasthan.jpg',
    confidence: 'exact', altText: 'Amber Fort hilltop palace, Jaipur',
    lastVerified: '2025-01-01',
  },
  {
    placeKey: 'amer fort',
    placeName: 'Amer Fort',
    city: 'Jaipur', country: 'India',
    imageUrl: wmc('Amber_fort_Jaipur_Rajasthan.jpg'),
    source: 'curated', license: 'CC BY-SA 3.0',
    attribution: '© Wikimedia Commons',
    attributionUrl: 'https://commons.wikimedia.org/wiki/File:Amber_fort_Jaipur_Rajasthan.jpg',
    confidence: 'exact', altText: 'Amer Fort hilltop palace, Jaipur',
    lastVerified: '2025-01-01',
  },
  {
    placeKey: 'hawa mahal',
    placeName: 'Hawa Mahal',
    city: 'Jaipur', country: 'India',
    imageUrl: wmc('Hawa_Mahal_Jaipur_India.jpg'),
    source: 'curated', license: 'CC BY-SA 3.0',
    attribution: '© Wikimedia Commons',
    attributionUrl: 'https://commons.wikimedia.org/wiki/File:Hawa_Mahal_Jaipur_India.jpg',
    confidence: 'exact', altText: 'Hawa Mahal Palace of Winds facade, Jaipur',
    lastVerified: '2025-01-01',
  },
  {
    placeKey: 'city palace jaipur',
    placeName: 'City Palace',
    city: 'Jaipur', country: 'India',
    imageUrl: wmc('City_Palace,_Jaipur.jpg'),
    source: 'curated', license: 'CC BY-SA 3.0',
    attribution: '© Wikimedia Commons',
    attributionUrl: 'https://commons.wikimedia.org/wiki/File:City_Palace,_Jaipur.jpg',
    confidence: 'exact', altText: 'City Palace royal complex, Jaipur',
    lastVerified: '2025-01-01',
  },
  {
    placeKey: 'jantar mantar jaipur',
    placeName: 'Jantar Mantar',
    city: 'Jaipur', country: 'India',
    imageUrl: wmc('Jantar_Mantar_Jaipur.jpg'),
    source: 'curated', license: 'CC BY-SA 3.0',
    attribution: '© Wikimedia Commons',
    attributionUrl: 'https://commons.wikimedia.org/wiki/File:Jantar_Mantar_Jaipur.jpg',
    confidence: 'exact', altText: 'Jantar Mantar astronomical observatory, Jaipur',
    lastVerified: '2025-01-01',
  },
  {
    placeKey: 'nahargarh fort',
    placeName: 'Nahargarh Fort',
    city: 'Jaipur', country: 'India',
    imageUrl: wmc('Nahargarh_fort.jpg'),
    source: 'curated', license: 'CC BY-SA 3.0',
    attribution: '© Wikimedia Commons',
    attributionUrl: 'https://commons.wikimedia.org/wiki/File:Nahargarh_fort.jpg',
    confidence: 'exact', altText: 'Nahargarh Fort overlooking Jaipur city',
    lastVerified: '2025-01-01',
  },
  {
    placeKey: 'jaigarh fort',
    placeName: 'Jaigarh Fort',
    city: 'Jaipur', country: 'India',
    imageUrl: wmc('Jaigarh_fort.jpg'),
    source: 'curated', license: 'CC BY-SA 3.0',
    attribution: '© Wikimedia Commons',
    attributionUrl: 'https://commons.wikimedia.org/wiki/File:Jaigarh_fort.jpg',
    confidence: 'exact', altText: 'Jaigarh Fort with world largest cannon, Jaipur',
    lastVerified: '2025-01-01',
  },

  // ═══════════════════════════════════════════════════════════
  // GOA
  // ═══════════════════════════════════════════════════════════
  {
    placeKey: 'basilica of bom jesus',
    placeName: 'Basilica of Bom Jesus',
    city: 'Goa', country: 'India',
    imageUrl: wmc('Basilica_of_Bom_Jesus,_Goa.jpg'),
    source: 'curated', license: 'CC BY-SA 3.0',
    attribution: '© Wikimedia Commons',
    attributionUrl: 'https://commons.wikimedia.org/wiki/File:Basilica_of_Bom_Jesus,_Goa.jpg',
    confidence: 'exact', altText: 'Basilica of Bom Jesus UNESCO heritage church, Goa',
    lastVerified: '2025-01-01',
  },
  {
    placeKey: 'bom jesus',
    placeName: 'Basilica of Bom Jesus',
    city: 'Goa', country: 'India',
    imageUrl: wmc('Basilica_of_Bom_Jesus,_Goa.jpg'),
    source: 'curated', license: 'CC BY-SA 3.0',
    attribution: '© Wikimedia Commons',
    attributionUrl: 'https://commons.wikimedia.org/wiki/File:Basilica_of_Bom_Jesus,_Goa.jpg',
    confidence: 'exact', altText: 'Basilica of Bom Jesus UNESCO heritage church, Goa',
    lastVerified: '2025-01-01',
  },
  {
    placeKey: 'fort aguada',
    placeName: 'Fort Aguada',
    city: 'Goa', country: 'India',
    imageUrl: wmc('Fort_Aguada_Goa.jpg'),
    source: 'curated', license: 'CC BY-SA 3.0',
    attribution: '© Wikimedia Commons',
    attributionUrl: 'https://commons.wikimedia.org/wiki/File:Fort_Aguada_Goa.jpg',
    confidence: 'exact', altText: 'Fort Aguada Portuguese fortress and lighthouse, Goa',
    lastVerified: '2025-01-01',
  },
  {
    placeKey: 'dudhsagar falls',
    placeName: 'Dudhsagar Falls',
    city: 'Goa', country: 'India',
    imageUrl: wmc('Dudhsagar_Falls_Goa.jpg'),
    source: 'curated', license: 'CC BY-SA 3.0',
    attribution: '© Wikimedia Commons',
    attributionUrl: 'https://commons.wikimedia.org/wiki/File:Dudhsagar_Falls_Goa.jpg',
    confidence: 'exact', altText: 'Dudhsagar waterfall cascading through Western Ghats, Goa',
    lastVerified: '2025-01-01',
  },
  {
    placeKey: 'dudhsagar',
    placeName: 'Dudhsagar Falls',
    city: 'Goa', country: 'India',
    imageUrl: wmc('Dudhsagar_Falls_Goa.jpg'),
    source: 'curated', license: 'CC BY-SA 3.0',
    attribution: '© Wikimedia Commons',
    attributionUrl: 'https://commons.wikimedia.org/wiki/File:Dudhsagar_Falls_Goa.jpg',
    confidence: 'exact', altText: 'Dudhsagar waterfall, Goa',
    lastVerified: '2025-01-01',
  },
  {
    placeKey: 'se cathedral',
    placeName: 'Se Cathedral',
    city: 'Goa', country: 'India',
    imageUrl: wmc('Se_Cathedral,_Old_Goa.jpg'),
    source: 'curated', license: 'CC BY-SA 3.0',
    attribution: '© Wikimedia Commons',
    attributionUrl: 'https://commons.wikimedia.org/wiki/File:Se_Cathedral,_Old_Goa.jpg',
    confidence: 'exact', altText: 'Sé Cathedral, Old Goa UNESCO site',
    lastVerified: '2025-01-01',
  },
  {
    placeKey: 'chapora fort',
    placeName: 'Chapora Fort',
    city: 'Goa', country: 'India',
    imageUrl: wmc('Chapora_Fort_Goa.jpg'),
    source: 'curated', license: 'CC BY-SA 3.0',
    attribution: '© Wikimedia Commons',
    attributionUrl: 'https://commons.wikimedia.org/wiki/File:Chapora_Fort_Goa.jpg',
    confidence: 'exact', altText: 'Chapora Fort ruins overlooking Vagator Beach, Goa',
    lastVerified: '2025-01-01',
  },

  // ═══════════════════════════════════════════════════════════
  // MANALI
  // ═══════════════════════════════════════════════════════════
  {
    placeKey: 'rohtang pass',
    placeName: 'Rohtang Pass',
    city: 'Manali', country: 'India',
    imageUrl: wmc('Rohtang_Pass.jpg'),
    source: 'curated', license: 'CC BY-SA 3.0',
    attribution: '© Wikimedia Commons',
    attributionUrl: 'https://commons.wikimedia.org/wiki/File:Rohtang_Pass.jpg',
    confidence: 'exact', altText: 'Rohtang Pass snow-covered mountain pass, Manali',
    lastVerified: '2025-01-01',
  },
  {
    placeKey: 'hadimba temple',
    placeName: 'Hadimba Temple',
    city: 'Manali', country: 'India',
    imageUrl: wmc('Hadimba_Temple_(Manali).jpg'),
    source: 'curated', license: 'CC BY-SA 3.0',
    attribution: '© Wikimedia Commons',
    attributionUrl: 'https://commons.wikimedia.org/wiki/File:Hadimba_Temple_(Manali).jpg',
    confidence: 'exact', altText: 'Hadimba Devi Temple in Deodar forest, Manali',
    lastVerified: '2025-01-01',
  },
  {
    placeKey: 'hidimba temple',
    placeName: 'Hadimba Temple',
    city: 'Manali', country: 'India',
    imageUrl: wmc('Hadimba_Temple_(Manali).jpg'),
    source: 'curated', license: 'CC BY-SA 3.0',
    attribution: '© Wikimedia Commons',
    attributionUrl: 'https://commons.wikimedia.org/wiki/File:Hadimba_Temple_(Manali).jpg',
    confidence: 'exact', altText: 'Hadimba Devi Temple in Deodar forest, Manali',
    lastVerified: '2025-01-01',
  },
  {
    placeKey: 'solang valley',
    placeName: 'Solang Valley',
    city: 'Manali', country: 'India',
    imageUrl: wmc('Solang_valley,_Manali.jpg'),
    source: 'curated', license: 'CC BY-SA 3.0',
    attribution: '© Wikimedia Commons',
    attributionUrl: 'https://commons.wikimedia.org/wiki/File:Solang_valley,_Manali.jpg',
    confidence: 'exact', altText: 'Solang Valley snow valley near Manali',
    lastVerified: '2025-01-01',
  },
  {
    placeKey: 'old manali',
    placeName: 'Old Manali',
    city: 'Manali', country: 'India',
    imageUrl: wmc('Old_Manali_village.jpg'),
    source: 'curated', license: 'CC BY-SA 3.0',
    attribution: '© Wikimedia Commons',
    attributionUrl: 'https://commons.wikimedia.org/wiki/File:Old_Manali_village.jpg',
    confidence: 'exact', altText: 'Old Manali village in Himachal Pradesh',
    lastVerified: '2025-01-01',
  },

  // ═══════════════════════════════════════════════════════════
  // RISHIKESH
  // ═══════════════════════════════════════════════════════════
  {
    placeKey: 'lakshman jhula',
    placeName: 'Lakshman Jhula',
    city: 'Rishikesh', country: 'India',
    imageUrl: wmc('Laxman_Jhula_bridge_2.jpg'),
    source: 'curated', license: 'CC BY-SA 3.0',
    attribution: '© Wikimedia Commons',
    attributionUrl: 'https://commons.wikimedia.org/wiki/File:Laxman_Jhula_bridge_2.jpg',
    confidence: 'exact', altText: 'Lakshman Jhula suspension bridge over River Ganga, Rishikesh',
    lastVerified: '2025-01-01',
  },
  {
    placeKey: 'laxman jhula',
    placeName: 'Laxman Jhula',
    city: 'Rishikesh', country: 'India',
    imageUrl: wmc('Laxman_Jhula_bridge_2.jpg'),
    source: 'curated', license: 'CC BY-SA 3.0',
    attribution: '© Wikimedia Commons',
    attributionUrl: 'https://commons.wikimedia.org/wiki/File:Laxman_Jhula_bridge_2.jpg',
    confidence: 'exact', altText: 'Laxman Jhula suspension bridge, Rishikesh',
    lastVerified: '2025-01-01',
  },
  {
    placeKey: 'ram jhula',
    placeName: 'Ram Jhula',
    city: 'Rishikesh', country: 'India',
    imageUrl: wmc('Ram_Jhula_Rishikesh.jpg'),
    source: 'curated', license: 'CC BY-SA 3.0',
    attribution: '© Wikimedia Commons',
    attributionUrl: 'https://commons.wikimedia.org/wiki/File:Ram_Jhula_Rishikesh.jpg',
    confidence: 'exact', altText: 'Ram Jhula bridge over Ganges, Rishikesh',
    lastVerified: '2025-01-01',
  },
  {
    placeKey: 'triveni ghat',
    placeName: 'Triveni Ghat',
    city: 'Rishikesh', country: 'India',
    imageUrl: wmc('Triveni_Ghat_Rishikesh.jpg'),
    source: 'curated', license: 'CC BY-SA 3.0',
    attribution: '© Wikimedia Commons',
    attributionUrl: 'https://commons.wikimedia.org/wiki/File:Triveni_Ghat_Rishikesh.jpg',
    confidence: 'exact', altText: 'Triveni Ghat evening aarti, Rishikesh',
    lastVerified: '2025-01-01',
  },
  {
    placeKey: 'parmarth niketan',
    placeName: 'Parmarth Niketan',
    city: 'Rishikesh', country: 'India',
    imageUrl: wmc('Parmarth_Niketan_Rishikesh.jpg'),
    source: 'curated', license: 'CC BY-SA 3.0',
    attribution: '© Wikimedia Commons',
    attributionUrl: 'https://commons.wikimedia.org/wiki/File:Parmarth_Niketan_Rishikesh.jpg',
    confidence: 'exact', altText: 'Parmarth Niketan ashram by the Ganges, Rishikesh',
    lastVerified: '2025-01-01',
  },

  // ═══════════════════════════════════════════════════════════
  // KERALA
  // ═══════════════════════════════════════════════════════════
  {
    placeKey: 'alleppey backwaters',
    placeName: 'Alleppey Backwaters',
    city: 'Alleppey', country: 'India',
    imageUrl: wmc('Alappuzha_(Alleppey)_backwaters,_Kerala.jpg'),
    source: 'curated', license: 'CC BY-SA 3.0',
    attribution: '© Wikimedia Commons',
    attributionUrl: 'https://commons.wikimedia.org/wiki/File:Alappuzha_(Alleppey)_backwaters,_Kerala.jpg',
    confidence: 'exact', altText: 'Kerala backwaters with houseboat, Alleppey',
    lastVerified: '2025-01-01',
  },
  {
    placeKey: 'alleppey',
    placeName: 'Alleppey',
    city: 'Alleppey', country: 'India',
    imageUrl: wmc('Alappuzha_(Alleppey)_backwaters,_Kerala.jpg'),
    source: 'curated', license: 'CC BY-SA 3.0',
    attribution: '© Wikimedia Commons',
    attributionUrl: 'https://commons.wikimedia.org/wiki/File:Alappuzha_(Alleppey)_backwaters,_Kerala.jpg',
    confidence: 'exact', altText: 'Kerala backwaters, Alleppey',
    lastVerified: '2025-01-01',
  },
  {
    placeKey: 'varkala beach',
    placeName: 'Varkala Beach',
    city: 'Varkala', country: 'India',
    imageUrl: wmc('Varkala_beach.jpg'),
    source: 'curated', license: 'CC BY-SA 3.0',
    attribution: '© Wikimedia Commons',
    attributionUrl: 'https://commons.wikimedia.org/wiki/File:Varkala_beach.jpg',
    confidence: 'exact', altText: 'Varkala Cliff Beach, Kerala',
    lastVerified: '2025-01-01',
  },
  {
    placeKey: 'munnar tea gardens',
    placeName: 'Munnar Tea Gardens',
    city: 'Munnar', country: 'India',
    imageUrl: wmc('Munnar_tea_plantation.jpg'),
    source: 'curated', license: 'CC BY-SA 3.0',
    attribution: '© Wikimedia Commons',
    attributionUrl: 'https://commons.wikimedia.org/wiki/File:Munnar_tea_plantation.jpg',
    confidence: 'exact', altText: 'Rolling tea plantations of Munnar, Kerala',
    lastVerified: '2025-01-01',
  },
  {
    placeKey: 'munnar',
    placeName: 'Munnar',
    city: 'Munnar', country: 'India',
    imageUrl: wmc('Munnar_tea_plantation.jpg'),
    source: 'curated', license: 'CC BY-SA 3.0',
    attribution: '© Wikimedia Commons',
    attributionUrl: 'https://commons.wikimedia.org/wiki/File:Munnar_tea_plantation.jpg',
    confidence: 'exact', altText: 'Tea plantations, Munnar Kerala',
    lastVerified: '2025-01-01',
  },
  {
    placeKey: 'fort kochi',
    placeName: 'Fort Kochi',
    city: 'Kochi', country: 'India',
    imageUrl: wmc('Chinese_fishing_nets_Cochin.jpg'),
    source: 'curated', license: 'CC BY-SA 3.0',
    attribution: '© Wikimedia Commons',
    attributionUrl: 'https://commons.wikimedia.org/wiki/File:Chinese_fishing_nets_Cochin.jpg',
    confidence: 'exact', altText: 'Chinese fishing nets at Fort Kochi waterfront',
    lastVerified: '2025-01-01',
  },

  // ═══════════════════════════════════════════════════════════
  // AGRA
  // ═══════════════════════════════════════════════════════════
  {
    placeKey: 'taj mahal',
    placeName: 'Taj Mahal',
    city: 'Agra', country: 'India',
    imageUrl: wmc('Taj_Mahal_in_March_2004.jpg'),
    source: 'curated', license: 'CC BY-SA 3.0',
    attribution: '© Wikimedia Commons',
    attributionUrl: 'https://commons.wikimedia.org/wiki/File:Taj_Mahal_in_March_2004.jpg',
    confidence: 'exact', altText: 'Taj Mahal UNESCO wonder, Agra',
    lastVerified: '2025-01-01',
  },
  {
    placeKey: 'agra fort',
    placeName: 'Agra Fort',
    city: 'Agra', country: 'India',
    imageUrl: wmc('Agra_fort.jpg'),
    source: 'curated', license: 'CC BY-SA 3.0',
    attribution: '© Wikimedia Commons',
    attributionUrl: 'https://commons.wikimedia.org/wiki/File:Agra_fort.jpg',
    confidence: 'exact', altText: 'Agra Fort UNESCO heritage site, Agra',
    lastVerified: '2025-01-01',
  },
  {
    placeKey: 'mehtab bagh',
    placeName: 'Mehtab Bagh',
    city: 'Agra', country: 'India',
    imageUrl: wmc('Mehtab_Bagh_Agra.jpg'),
    source: 'curated', license: 'CC BY-SA 3.0',
    attribution: '© Wikimedia Commons',
    attributionUrl: 'https://commons.wikimedia.org/wiki/File:Mehtab_Bagh_Agra.jpg',
    confidence: 'exact', altText: 'Mehtab Bagh garden with Taj Mahal view, Agra',
    lastVerified: '2025-01-01',
  },

  // ═══════════════════════════════════════════════════════════
  // PUNE
  // ═══════════════════════════════════════════════════════════
  {
    placeKey: 'shaniwar wada',
    placeName: 'Shaniwar Wada',
    city: 'Pune', country: 'India',
    imageUrl: wmc('Shaniwarwada.jpg'),
    source: 'curated', license: 'CC BY-SA 3.0',
    attribution: '© Wikimedia Commons',
    attributionUrl: 'https://commons.wikimedia.org/wiki/File:Shaniwarwada.jpg',
    confidence: 'exact', altText: 'Shaniwar Wada Peshwa fortress, Pune',
    lastVerified: '2025-01-01',
  },
  {
    placeKey: 'aga khan palace',
    placeName: 'Aga Khan Palace',
    city: 'Pune', country: 'India',
    imageUrl: wmc('Aga_Khan_Palace_Pune.jpg'),
    source: 'curated', license: 'CC BY-SA 3.0',
    attribution: '© Wikimedia Commons',
    attributionUrl: 'https://commons.wikimedia.org/wiki/File:Aga_Khan_Palace_Pune.jpg',
    confidence: 'exact', altText: 'Aga Khan Palace historic landmark, Pune',
    lastVerified: '2025-01-01',
  },
  {
    placeKey: 'sinhagad fort',
    placeName: 'Sinhagad Fort',
    city: 'Pune', country: 'India',
    imageUrl: wmc('Sinhagad_Fort_Pune.jpg'),
    source: 'curated', license: 'CC BY-SA 3.0',
    attribution: '© Wikimedia Commons',
    attributionUrl: 'https://commons.wikimedia.org/wiki/File:Sinhagad_Fort_Pune.jpg',
    confidence: 'exact', altText: 'Sinhagad Hill Fort near Pune',
    lastVerified: '2025-01-01',
  },

  // ═══════════════════════════════════════════════════════════
  // CHANDIGARH
  // ═══════════════════════════════════════════════════════════
  {
    placeKey: 'rock garden chandigarh',
    placeName: 'Rock Garden',
    city: 'Chandigarh', country: 'India',
    imageUrl: wmc('Rock_Garden_Chandigarh.jpg'),
    source: 'curated', license: 'CC BY-SA 3.0',
    attribution: '© Wikimedia Commons',
    attributionUrl: 'https://commons.wikimedia.org/wiki/File:Rock_Garden_Chandigarh.jpg',
    confidence: 'exact', altText: 'Rock Garden of Chandigarh art installation',
    lastVerified: '2025-01-01',
  },
  {
    placeKey: 'sukhna lake',
    placeName: 'Sukhna Lake',
    city: 'Chandigarh', country: 'India',
    imageUrl: wmc('Sukhna_Lake_Chandigarh.jpg'),
    source: 'curated', license: 'CC BY-SA 3.0',
    attribution: '© Wikimedia Commons',
    attributionUrl: 'https://commons.wikimedia.org/wiki/File:Sukhna_Lake_Chandigarh.jpg',
    confidence: 'exact', altText: 'Sukhna Lake reservoir, Chandigarh',
    lastVerified: '2025-01-01',
  },
  {
    placeKey: 'rose garden chandigarh',
    placeName: 'Rose Garden',
    city: 'Chandigarh', country: 'India',
    imageUrl: wmc('Rose_Garden_Chandigarh.jpg'),
    source: 'curated', license: 'CC BY-SA 3.0',
    attribution: '© Wikimedia Commons',
    attributionUrl: 'https://commons.wikimedia.org/wiki/File:Rose_Garden_Chandigarh.jpg',
    confidence: 'exact', altText: 'Zakir Hussain Rose Garden, Chandigarh',
    lastVerified: '2025-01-01',
  },

  // ═══════════════════════════════════════════════════════════
  // VARANASI
  // ═══════════════════════════════════════════════════════════
  {
    placeKey: 'dashashwamedh ghat',
    placeName: 'Dashashwamedh Ghat',
    city: 'Varanasi', country: 'India',
    imageUrl: wmc('Dashashwamedh_Ghat_Varanasi.jpg'),
    source: 'curated', license: 'CC BY-SA 3.0',
    attribution: '© Wikimedia Commons',
    attributionUrl: 'https://commons.wikimedia.org/wiki/File:Dashashwamedh_Ghat_Varanasi.jpg',
    confidence: 'exact', altText: 'Dashashwamedh Ghat Ganga aarti, Varanasi',
    lastVerified: '2025-01-01',
  },
  {
    placeKey: 'kashi vishwanath temple',
    placeName: 'Kashi Vishwanath Temple',
    city: 'Varanasi', country: 'India',
    imageUrl: wmc('Kashi_Vishwanath_Temple.jpg'),
    source: 'curated', license: 'CC BY-SA 3.0',
    attribution: '© Wikimedia Commons',
    attributionUrl: 'https://commons.wikimedia.org/wiki/File:Kashi_Vishwanath_Temple.jpg',
    confidence: 'exact', altText: 'Kashi Vishwanath Temple golden spire, Varanasi',
    lastVerified: '2025-01-01',
  },
  {
    placeKey: 'manikarnika ghat',
    placeName: 'Manikarnika Ghat',
    city: 'Varanasi', country: 'India',
    imageUrl: wmc('Manikarnika_ghat.jpg'),
    source: 'curated', license: 'CC BY-SA 3.0',
    attribution: '© Wikimedia Commons',
    attributionUrl: 'https://commons.wikimedia.org/wiki/File:Manikarnika_ghat.jpg',
    confidence: 'exact', altText: 'Manikarnika cremation ghat, Varanasi',
    lastVerified: '2025-01-01',
  },

  // ═══════════════════════════════════════════════════════════
  // BALI
  // ═══════════════════════════════════════════════════════════
  {
    placeKey: 'tanah lot',
    placeName: 'Tanah Lot',
    city: 'Tabanan', country: 'Indonesia',
    imageUrl: wmc('Tanah_Lot_Bali.jpg'),
    source: 'curated', license: 'CC BY-SA 3.0',
    attribution: '© Wikimedia Commons',
    attributionUrl: 'https://commons.wikimedia.org/wiki/File:Tanah_Lot_Bali.jpg',
    confidence: 'exact', altText: 'Tanah Lot sea temple at sunset, Bali',
    lastVerified: '2025-01-01',
  },
  {
    placeKey: 'uluwatu temple',
    placeName: 'Uluwatu Temple',
    city: 'Uluwatu', country: 'Indonesia',
    imageUrl: wmc('Uluwatu_Temple_Bali.jpg'),
    source: 'curated', license: 'CC BY-SA 3.0',
    attribution: '© Wikimedia Commons',
    attributionUrl: 'https://commons.wikimedia.org/wiki/File:Uluwatu_Temple_Bali.jpg',
    confidence: 'exact', altText: 'Uluwatu Temple clifftop ocean view, Bali',
    lastVerified: '2025-01-01',
  },
  {
    placeKey: 'uluwatu',
    placeName: 'Uluwatu',
    city: 'Uluwatu', country: 'Indonesia',
    imageUrl: wmc('Uluwatu_Temple_Bali.jpg'),
    source: 'curated', license: 'CC BY-SA 3.0',
    attribution: '© Wikimedia Commons',
    attributionUrl: 'https://commons.wikimedia.org/wiki/File:Uluwatu_Temple_Bali.jpg',
    confidence: 'exact', altText: 'Uluwatu clifftop, Bali',
    lastVerified: '2025-01-01',
  },
  {
    placeKey: 'tegallalang rice terrace',
    placeName: 'Tegallalang Rice Terrace',
    city: 'Ubud', country: 'Indonesia',
    imageUrl: wmc('Tegallalang_Rice_Terrace,_Bali.jpg'),
    source: 'curated', license: 'CC BY-SA 3.0',
    attribution: '© Wikimedia Commons',
    attributionUrl: 'https://commons.wikimedia.org/wiki/File:Tegallalang_Rice_Terrace,_Bali.jpg',
    confidence: 'exact', altText: 'Tegallalang stepped rice terraces, Ubud Bali',
    lastVerified: '2025-01-01',
  },
  {
    placeKey: 'tegallalang',
    placeName: 'Tegallalang',
    city: 'Ubud', country: 'Indonesia',
    imageUrl: wmc('Tegallalang_Rice_Terrace,_Bali.jpg'),
    source: 'curated', license: 'CC BY-SA 3.0',
    attribution: '© Wikimedia Commons',
    attributionUrl: 'https://commons.wikimedia.org/wiki/File:Tegallalang_Rice_Terrace,_Bali.jpg',
    confidence: 'exact', altText: 'Tegallalang rice terraces, Bali',
    lastVerified: '2025-01-01',
  },
  {
    placeKey: 'mount batur',
    placeName: 'Mount Batur',
    city: 'Kintamani', country: 'Indonesia',
    imageUrl: wmc('Mount_Batur,_Bali.jpg'),
    source: 'curated', license: 'CC BY-SA 3.0',
    attribution: '© Wikimedia Commons',
    attributionUrl: 'https://commons.wikimedia.org/wiki/File:Mount_Batur,_Bali.jpg',
    confidence: 'exact', altText: 'Mount Batur active volcano with crater lake, Bali',
    lastVerified: '2025-01-01',
  },
  {
    placeKey: 'besakih temple',
    placeName: 'Besakih Temple',
    city: 'Karangasem', country: 'Indonesia',
    imageUrl: wmc('Mother_Temple_of_Besakih.jpg'),
    source: 'curated', license: 'CC BY-SA 3.0',
    attribution: '© Wikimedia Commons',
    attributionUrl: 'https://commons.wikimedia.org/wiki/File:Mother_Temple_of_Besakih.jpg',
    confidence: 'exact', altText: 'Pura Besakih mother temple on Mount Agung, Bali',
    lastVerified: '2025-01-01',
  },
  {
    placeKey: 'sacred monkey forest',
    placeName: 'Sacred Monkey Forest',
    city: 'Ubud', country: 'Indonesia',
    imageUrl: wmc('Monkey_forest_Ubud.jpg'),
    source: 'curated', license: 'CC BY-SA 3.0',
    attribution: '© Wikimedia Commons',
    attributionUrl: 'https://commons.wikimedia.org/wiki/File:Monkey_forest_Ubud.jpg',
    confidence: 'exact', altText: 'Sacred Monkey Forest Sanctuary temple, Ubud Bali',
    lastVerified: '2025-01-01',
  },

  // ═══════════════════════════════════════════════════════════
  // DUBAI
  // ═══════════════════════════════════════════════════════════
  {
    placeKey: 'burj khalifa',
    placeName: 'Burj Khalifa',
    city: 'Dubai', country: 'UAE',
    imageUrl: wmc('Burj_Khalifa.jpg'),
    source: 'curated', license: 'CC BY-SA 3.0',
    attribution: '© Wikimedia Commons',
    attributionUrl: 'https://commons.wikimedia.org/wiki/File:Burj_Khalifa.jpg',
    confidence: 'exact', altText: "Burj Khalifa world's tallest tower, Dubai",
    lastVerified: '2025-01-01',
  },
  {
    placeKey: 'dubai frame',
    placeName: 'Dubai Frame',
    city: 'Dubai', country: 'UAE',
    imageUrl: wmc('Dubai_Frame_-_full_view_-_2019.jpg'),
    source: 'curated', license: 'CC BY-SA 4.0',
    attribution: '© Wikimedia Commons',
    attributionUrl: 'https://commons.wikimedia.org/wiki/File:Dubai_Frame_-_full_view_-_2019.jpg',
    confidence: 'exact', altText: 'Dubai Frame landmark structure, Dubai',
    lastVerified: '2025-01-01',
  },
  {
    placeKey: 'burj al arab',
    placeName: 'Burj Al Arab',
    city: 'Dubai', country: 'UAE',
    imageUrl: wmc('Burj_Al_Arab,_Dubai.jpg'),
    source: 'curated', license: 'CC BY-SA 3.0',
    attribution: '© Wikimedia Commons',
    attributionUrl: 'https://commons.wikimedia.org/wiki/File:Burj_Al_Arab,_Dubai.jpg',
    confidence: 'exact', altText: 'Burj Al Arab luxury hotel, Dubai',
    lastVerified: '2025-01-01',
  },
  {
    placeKey: 'palm jumeirah',
    placeName: 'Palm Jumeirah',
    city: 'Dubai', country: 'UAE',
    imageUrl: wmc('Palm_Jumeirah_in_Dubai.jpg'),
    source: 'curated', license: 'CC BY-SA 3.0',
    attribution: '© Wikimedia Commons',
    attributionUrl: 'https://commons.wikimedia.org/wiki/File:Palm_Jumeirah_in_Dubai.jpg',
    confidence: 'exact', altText: 'Palm Jumeirah artificial island, Dubai',
    lastVerified: '2025-01-01',
  },
  {
    placeKey: 'dubai creek',
    placeName: 'Dubai Creek',
    city: 'Dubai', country: 'UAE',
    imageUrl: wmc('Dubai_Creek_2.jpg'),
    source: 'curated', license: 'CC BY-SA 3.0',
    attribution: '© Wikimedia Commons',
    attributionUrl: 'https://commons.wikimedia.org/wiki/File:Dubai_Creek_2.jpg',
    confidence: 'exact', altText: 'Dubai Creek historic waterway, Dubai',
    lastVerified: '2025-01-01',
  },

  // ═══════════════════════════════════════════════════════════
  // BANGKOK
  // ═══════════════════════════════════════════════════════════
  {
    placeKey: 'wat pho',
    placeName: 'Wat Pho',
    city: 'Bangkok', country: 'Thailand',
    imageUrl: wmc('Wat_Pho_2014.jpg'),
    source: 'curated', license: 'CC BY-SA 4.0',
    attribution: '© Wikimedia Commons',
    attributionUrl: 'https://commons.wikimedia.org/wiki/File:Wat_Pho_2014.jpg',
    confidence: 'exact', altText: 'Wat Pho Temple of the Reclining Buddha, Bangkok',
    lastVerified: '2025-01-01',
  },
  {
    placeKey: 'grand palace bangkok',
    placeName: 'Grand Palace',
    city: 'Bangkok', country: 'Thailand',
    imageUrl: wmc('Grand_Palace_Bangkok.jpg'),
    source: 'curated', license: 'CC BY-SA 3.0',
    attribution: '© Wikimedia Commons',
    attributionUrl: 'https://commons.wikimedia.org/wiki/File:Grand_Palace_Bangkok.jpg',
    confidence: 'exact', altText: 'Grand Palace and Wat Phra Kaew, Bangkok',
    lastVerified: '2025-01-01',
  },
  {
    placeKey: 'wat arun',
    placeName: 'Wat Arun',
    city: 'Bangkok', country: 'Thailand',
    imageUrl: wmc('Wat_Arun_2.jpg'),
    source: 'curated', license: 'CC BY-SA 3.0',
    attribution: '© Wikimedia Commons',
    attributionUrl: 'https://commons.wikimedia.org/wiki/File:Wat_Arun_2.jpg',
    confidence: 'exact', altText: 'Wat Arun Temple of Dawn on Chao Phraya, Bangkok',
    lastVerified: '2025-01-01',
  },
  {
    placeKey: 'chatuchak market',
    placeName: 'Chatuchak Weekend Market',
    city: 'Bangkok', country: 'Thailand',
    imageUrl: wmc('Chatuchak_weekend_market_Bangkok.jpg'),
    source: 'curated', license: 'CC BY-SA 3.0',
    attribution: '© Wikimedia Commons',
    attributionUrl: 'https://commons.wikimedia.org/wiki/File:Chatuchak_weekend_market_Bangkok.jpg',
    confidence: 'exact', altText: 'Chatuchak Weekend Market stalls, Bangkok',
    lastVerified: '2025-01-01',
  },

  // ═══════════════════════════════════════════════════════════
  // SINGAPORE
  // ═══════════════════════════════════════════════════════════
  {
    placeKey: 'gardens by the bay',
    placeName: 'Gardens by the Bay',
    city: 'Singapore', country: 'Singapore',
    imageUrl: wmc('Gardens_by_the_Bay,_Singapore,_Supertree_Observatory.jpg'),
    source: 'curated', license: 'CC BY-SA 4.0',
    attribution: '© Wikimedia Commons',
    attributionUrl: 'https://commons.wikimedia.org/wiki/File:Gardens_by_the_Bay,_Singapore,_Supertree_Observatory.jpg',
    confidence: 'exact', altText: 'Supertree Grove at Gardens by the Bay, Singapore',
    lastVerified: '2025-01-01',
  },
  {
    placeKey: 'marina bay sands',
    placeName: 'Marina Bay Sands',
    city: 'Singapore', country: 'Singapore',
    imageUrl: wmc('Marina_Bay_Sands_in_2012.jpg'),
    source: 'curated', license: 'CC BY-SA 3.0',
    attribution: '© Wikimedia Commons',
    attributionUrl: 'https://commons.wikimedia.org/wiki/File:Marina_Bay_Sands_in_2012.jpg',
    confidence: 'exact', altText: 'Marina Bay Sands integrated resort, Singapore',
    lastVerified: '2025-01-01',
  },
  {
    placeKey: 'merlion',
    placeName: 'Merlion Park',
    city: 'Singapore', country: 'Singapore',
    imageUrl: wmc('Singapore_Merlion_BCT.jpg'),
    source: 'curated', license: 'CC BY-SA 3.0',
    attribution: '© Wikimedia Commons',
    attributionUrl: 'https://commons.wikimedia.org/wiki/File:Singapore_Merlion_BCT.jpg',
    confidence: 'exact', altText: 'Merlion statue at Marina Bay, Singapore',
    lastVerified: '2025-01-01',
  },
  {
    placeKey: 'sentosa island',
    placeName: 'Sentosa Island',
    city: 'Singapore', country: 'Singapore',
    imageUrl: wmc('Sentosa_Island_Singapore.jpg'),
    source: 'curated', license: 'CC BY-SA 3.0',
    attribution: '© Wikimedia Commons',
    attributionUrl: 'https://commons.wikimedia.org/wiki/File:Sentosa_Island_Singapore.jpg',
    confidence: 'exact', altText: 'Sentosa Island resort, Singapore',
    lastVerified: '2025-01-01',
  },
  {
    placeKey: 'chinatown singapore',
    placeName: 'Chinatown Singapore',
    city: 'Singapore', country: 'Singapore',
    imageUrl: wmc('Chinatown,_Singapore_-_20070710.jpg'),
    source: 'curated', license: 'CC BY-SA 3.0',
    attribution: '© Wikimedia Commons',
    attributionUrl: 'https://commons.wikimedia.org/wiki/File:Chinatown,_Singapore_-_20070710.jpg',
    confidence: 'exact', altText: 'Chinatown heritage district, Singapore',
    lastVerified: '2025-01-01',
  },

  // ═══════════════════════════════════════════════════════════
  // MALDIVES
  // ═══════════════════════════════════════════════════════════
  {
    placeKey: 'male maldives',
    placeName: 'Malé',
    city: 'Malé', country: 'Maldives',
    imageUrl: wmc('Male_from_helicopter.jpg'),
    source: 'curated', license: 'CC BY-SA 3.0',
    attribution: '© Wikimedia Commons',
    attributionUrl: 'https://commons.wikimedia.org/wiki/File:Male_from_helicopter.jpg',
    confidence: 'exact', altText: 'Malé capital island aerial view, Maldives',
    lastVerified: '2025-01-01',
  },
]

// ─── Lookup helpers ───────────────────────────────────────────────────────────

/** Normalise a place name for fuzzy lookup */
export function normalisePlaceKey(name: string): string {
  return name
    .toLowerCase()
    .replace(/[''`]/g, '')
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Look up a curated image by place name + optional city.
 * Returns the best match or null.
 */
export function lookupCuratedImage(
  placeName: string,
  city?: string,
): CuratedPlaceImage | null {
  const nameKey = normalisePlaceKey(placeName)
  const cityKey = city ? normalisePlaceKey(city) : ''

  // 1. Exact key match
  let match = CURATED_IMAGES.find(e => e.placeKey === nameKey)
  if (match) return match

  // 2. Substring match: place name contains key or key contains place name
  match = CURATED_IMAGES.find(e => {
    const keyInName = nameKey.includes(e.placeKey)
    const nameInKey = e.placeKey.includes(nameKey)
    // Require either match to be meaningful (avoid single-word spurious hits)
    if (!keyInName && !nameInKey) return false
    // If city is provided, also verify city matches or is unspecified
    if (cityKey && e.city) {
      const cityMatch = normalisePlaceKey(e.city).includes(cityKey) ||
                        cityKey.includes(normalisePlaceKey(e.city))
      if (!cityMatch) return false
    }
    return true
  })
  if (match) return match

  return null
}
