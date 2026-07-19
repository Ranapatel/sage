// ─── TripSage Visa Database ──────────────────────────────────────────────────
// Static visa requirements for Indian passport holders.
// Covers 35+ country groups / 60+ destination keywords.
// Last updated: July 2026

export type VisaBadge = 'Ready' | 'Easy' | 'Action needed' | 'Check required'

export interface VisaEntry {
  country: string
  visaStatus: string
  processingTime: string
  badge: VisaBadge
  badgeColor: string
  badgeBg: string
  badgeBorder: string
  docs: string[]
  caution: string
  officialLink: string
}

const BADGE_STYLES: Record<VisaBadge, [string, string, string]> = {
  'Ready':          ['#16A34A', '#F0FDF4', '#BBF7D0'],
  'Easy':           ['#0369A1', '#EFF6FF', '#BFDBFE'],
  'Action needed':  ['#DC2626', '#FEF2F2', '#FCA5A5'],
  'Check required': ['#EA580C', '#FFF7ED', '#FED7AA'],
}

const v = (
  country: string,
  visaStatus: string,
  processingTime: string,
  badge: VisaBadge,
  docs: string[],
  caution: string,
  officialLink: string
): VisaEntry => {
  const [badgeColor, badgeBg, badgeBorder] = BADGE_STYLES[badge]
  return { country, visaStatus, processingTime, badge, badgeColor, badgeBg, badgeBorder, docs, caution, officialLink }
}

const BASE = ['Passport (valid > 6 months)', 'Return flight ticket', 'Accommodation booking', 'Sufficient funds']

export const VISA_DB: { keywords: string[]; data: VisaEntry }[] = [
  { keywords: ['thailand','bangkok','phuket','krabi','chiang mai','koh samui','pattaya'],
    data: v('Thailand','Visa-free (60 days)','Instant on arrival','Ready',[...BASE,'Proof of funds: 10,000 THB/person'],'Return flight must be within 60 days. Extendable once for 30 more days at immigration.','https://www.thaiembassy.com/') },
  { keywords: ['maldives','male','hulhumale'],
    data: v('Maldives','Visa on Arrival (30 days)','Instant on arrival','Ready',[...BASE,'IMUGA Traveler Declaration (online, within 96 hrs of arrival)'],'Fill IMUGA form before departure — takes 5 minutes. Free of charge.','https://imuga.immigration.gov.mv/') },
  { keywords: ['bali','indonesia','jakarta','lombok','yogyakarta','komodo'],
    data: v('Indonesia','Visa on Arrival / E-VOA','Instant (E-VOA: 1-2 days online)','Ready',[...BASE,'E-Customs Declaration (CEISA app)'],'VOA fee ~Rs 2,000. Recommend E-VOA online to skip queues.','https://molina.imigrasi.go.id/') },
  { keywords: ['nepal','kathmandu','pokhara','chitwan','lumbini','everest'],
    data: v('Nepal','No Visa Required','Instant','Ready',['Valid Indian Passport OR Voter ID Card'],'Indians can enter Nepal without a passport — voter ID accepted. No visa or fee.','https://www.immigration.gov.np/') },
  { keywords: ['bhutan','thimphu','paro','punakha'],
    data: v('Bhutan','No Visa Required (Indian citizens)','Instant','Ready',['Valid Indian Passport OR Voter ID Card'],'No visa fee for Indians. Entry via Phuentsholing or Paro airport. SDF levy applies for non-Bhutanese airlines.','https://www.mofa.gov.bt/') },
  { keywords: ['mauritius','port louis'],
    data: v('Mauritius','Visa-free (60 days)','Instant on arrival','Ready',[...BASE],'No visa required. Just show return ticket at immigration.','https://www.passport.gov.mu/') },
  { keywords: ['malaysia','kuala lumpur','langkawi','penang','borneo','kota kinabalu','malacca'],
    data: v('Malaysia','Visa-free (30 days)','Instant on arrival','Ready',['Passport (valid > 6 months)','Return flight ticket','MDAC digital arrival card'],'No visa needed. Extendable at immigration up to 90 days total.','https://www.imi.gov.my/') },
  { keywords: ['qatar','doha','lusail'],
    data: v('Qatar','Visa on Arrival','Instant','Ready',['Passport (valid > 6 months)','Return ticket','Hotel confirmation'],'Indians receive visa on arrival at Hamad International Airport. Free of charge.','https://www.moi.gov.qa/') },
  { keywords: ['seychelles','mahe','praslin'],
    data: v('Seychelles',"Visitor's Permit on Arrival (30 days)",'Instant','Ready',[...BASE],'Free visitor permit on arrival for all nationalities. No prior visa needed.','https://www.ics.gov.sc/') },
  { keywords: ['georgia','tbilisi','batumi','kutaisi'],
    data: v('Georgia','Visa-free (365 days)','Instant','Ready',['Passport (valid > 3 months)','Return ticket or onward travel proof'],'Indians get a full 1-year visa-free stay — one of the most generous visa policies in the world.','https://www.geoconsul.gov.ge/') },
  { keywords: ['peru','machu picchu','lima','cusco','nazca'],
    data: v('Peru','Visa-free (183 days)','Instant','Ready',['Passport (valid > 6 months)','Return ticket','Proof of funds'],'No visa required for Indians. Entry is very straightforward.','https://www.migraciones.gob.pe/') },
  { keywords: ['sri lanka','colombo','kandy','galle','sigiriya','ella'],
    data: v('Sri Lanka','Electronic Travel Authorization (ETA)','24-48 hours online','Easy',[...BASE,'ETA approval email (apply at eta.gov.lk)'],'Apply ETA at eta.gov.lk. Fee ~Rs 1,700. Approved within 24 hours typically.','https://www.eta.gov.lk/') },
  { keywords: ['cambodia','siem reap','phnom penh','angkor'],
    data: v('Cambodia','E-Visa / Visa on Arrival','3 business days (E-Visa)','Easy',[...BASE,'Passport photo (4x6cm)','USD 30 visa fee'],'E-Visa recommended over VoA. Apply at evisa.gov.kh.','https://www.evisa.gov.kh/') },
  { keywords: ['kenya','nairobi','maasai mara','mombasa'],
    data: v('Kenya','Electronic Travel Authorization (ETA)','3-5 working days','Easy',[...BASE,'Yellow fever vaccination certificate','ETA approval printout'],'ETA mandatory since 2024. Apply at etakenya.go.ke. Fee USD 50 (~Rs 4,200).','https://etakenya.go.ke/') },
  { keywords: ['vietnam','hanoi','ho chi minh','hoi an','da nang','halong','saigon','nha trang','hue'],
    data: v('Vietnam','E-Visa (90 days)','3 business days','Easy',[...BASE,'Digital passport photo'],'Apply at evisa.xuatnhapcanh.gov.vn. Fee ~Rs 2,100. Single or multiple entry.','https://evisa.xuatnhapcanh.gov.vn/') },
  { keywords: ['turkey','istanbul','cappadocia','ankara','antalya','bodrum','ephesus'],
    data: v('Turkey','E-Visa (30 days)','1-2 days online','Easy',[...BASE,'Credit card for fee (~Rs 3,500)'],'Apply at evisa.gov.tr. Approved within hours. Multiple-entry option available.','https://www.evisa.gov.tr/') },
  { keywords: ['egypt','cairo','luxor','aswan','sharm el sheikh','hurghada','alexandria'],
    data: v('Egypt','E-Visa or Visa on Arrival','24-48 hours','Easy',[...BASE,'Passport photo','USD 25 fee'],'E-Visa at visa2egypt.gov.eg recommended. VoA at Cairo airport also available.','https://visa2egypt.gov.eg/') },
  { keywords: ['jordan','amman','petra','wadi rum','aqaba'],
    data: v('Jordan','Visa on Arrival / Jordan Pass','Instant','Easy',[...BASE,'JD 40 (~Rs 5,000) waivable with Jordan Pass'],'Jordan Pass covers visa + 40+ sites including Petra. Book at jordanpass.jo.','https://www.jordanpass.jo/') },
  { keywords: ['oman','muscat','salalah','nizwa'],
    data: v('Oman','E-Visa (30 days)','1-3 days online','Easy',[...BASE,'Digital passport photo'],'Apply at evisa.rop.gov.om. 10-day, 30-day, and annual options.','https://evisa.rop.gov.om/') },
  { keywords: ['bahrain','manama'],
    data: v('Bahrain','E-Visa (2 weeks / 1 month)','24-48 hours','Easy',[...BASE,'Digital photo'],'Simple e-Visa at evisa.gov.bh. 2-week single or 1-month multiple entry.','https://www.evisa.gov.bh/') },
  { keywords: ['new zealand','auckland','queenstown','wellington','christchurch','rotorua'],
    data: v('New Zealand','NZeTA (Electronic Travel Authority)','72 hours','Easy',['Passport','NZeTA via official app or website','IVL fee NZD 35 (~Rs 1,800)'],'Apply via NZeTA app or nzeta.immigration.govt.nz. Up to 72 hours processing.','https://www.immigration.govt.nz/') },
  { keywords: ['ethiopia','addis ababa'],
    data: v('Ethiopia','E-Visa','3 business days','Easy',[...BASE,'Yellow fever certificate'],'Apply at evisa.gov.et. VoA also available at Addis Ababa airport.','https://www.evisa.gov.et/') },
  { keywords: ['dubai','uae','abu dhabi','sharjah','emirates','ras al khaimah'],
    data: v('UAE (Dubai / Abu Dhabi)','Pre-arranged E-Visa required','2-4 working days','Action needed',[...BASE,'Passport-size photo (white background)','Bank statement (3 months)'],'Apply at least 7 days before travel. Fee ~AED 350 (Rs 8,000) for 30 days. Book only refundable flights until visa is approved.','https://smart.gdrfad.gov.ae/') },
  { keywords: ['singapore'],
    data: v('Singapore','E-Visa (ICA) required','3-5 working days','Action needed',[...BASE,'SG Arrival Card (submit within 3 days of arrival separately)','Bank statements (3 months)'],'Apply via ICA website 2 weeks before departure. SG Arrival Card mandatory separately.','https://www.ica.gov.sg/') },
  { keywords: ['paris','france','rome','italy','venice','milan','barcelona','spain','amsterdam','netherlands','prague','czech','berlin','germany','vienna','austria','zurich','switzerland','schengen','europe','stockholm','norway','oslo','copenhagen','denmark','portugal','lisbon','athens','greece','santorini','mykonos','budapest','hungary','warsaw','poland','croatia','dubrovnik'],
    data: v('Schengen Area (Europe)','Embassy Schengen Visa required','15-20 working days','Action needed',['Passport (valid > 3 months after return)','Schengen visa application form','Travel medical insurance (min EUR 30,000 coverage)','Confirmed round-trip flight itinerary','Hotel/accommodation booking for all nights','Bank statements (last 3-6 months)','NOC from employer + ITR (last 3 years)','Salary slips (last 3 months)','Cover letter with detailed daily itinerary'],'Apply 4-6 weeks in advance. Book ONLY flexible/refundable flights & hotels until visa is in hand. Refusals are common without strong financial proof.','https://visa.vfsglobal.com/') },
  { keywords: ['london','uk','united kingdom','england','scotland','wales','edinburgh','manchester','oxford','cambridge'],
    data: v('United Kingdom','Standard Visitor Visa required','15-25 working days','Action needed',['Passport (all held passports)','Online visa application at gov.uk','Bank statements + payslips','Employer NOC + salary slips','Accommodation & itinerary details','Full travel history'],'UK visas are thoroughly scrutinized. Strong financial proof and ties to India (job, property, family) are critical. Book only refundable options.','https://www.gov.uk/standard-visitor-visa') },
  { keywords: ['usa','new york','los angeles','san francisco','chicago','las vegas','miami','washington','united states','america','boston','seattle','hawaii'],
    data: v('United States of America','B1/B2 Tourist Visa required','4-12 weeks (interview + processing)','Action needed',['US-format passport photo','DS-160 form (online)','Interview at US Consulate/Embassy','Bank statements (6 months)','Property/employment/family ties proof','Detailed travel itinerary'],'US visa requires in-person interview. Appointment wait in India: 2-12+ weeks. Apply at minimum 3 months before travel. DO NOT book non-refundable tickets.','https://travel.state.gov/') },
  { keywords: ['canada','toronto','vancouver','montreal','calgary','ottawa','banff','niagara'],
    data: v('Canada','Temporary Resident Visa (TRV)','2-8 weeks','Action needed',['Passport','Online TRV application','Bank statements (6 months)','Employer letter / NOC','Property/family ties proof','Detailed trip itinerary','Biometrics appointment'],'Canada visa refused without clear ties to India demonstrated. Strong financial proof required. Apply at least 2 months before travel.','https://www.canada.ca/en/immigration-refugees-citizenship/services/visit-canada.html') },
  { keywords: ['australia','sydney','melbourne','brisbane','perth','gold coast','cairns','uluru'],
    data: v('Australia','Tourist Visa (Subclass 600)','2-4 weeks','Action needed',['Passport','Online visa application','Bank statements','Employment or business proof','Travel itinerary + accommodation bookings','Biometrics at VFS (if required)'],'Apply at least 6 weeks before travel. Processing is unpredictable. Biometrics may be required.','https://immi.homeaffairs.gov.au/') },
  { keywords: ['japan','tokyo','kyoto','osaka','hokkaido','hiroshima','nara','nagoya'],
    data: v('Japan','Tourist Visa (via Consulate/VFS)','5-7 working days','Action needed',['Passport','Japan visa application form','Recent passport photo','Hotel booking + day-by-day itinerary','Return flight tickets','Bank statements (3 months)','Employer NOC + salary slips'],'Japan is testing e-Visa for select countries - verify current policy. Otherwise apply via Japanese Consulate or VFS.','https://www.in.emb-japan.go.jp/') },
  { keywords: ['china','beijing','shanghai','guangzhou','shenzhen','chengdu'],
    data: v('China','Tourist Visa (L-Visa)','4-7 working days','Action needed',['Passport (valid > 6 months)','China visa application form','Biometrics at Chinese Consulate or COVA','Round-trip flight booking','Hotel confirmation (all nights)','Bank statements'],'Requires physical visit to consulate for biometrics. Most Western social media is blocked inside China.','https://www.visaforchina.cn/') },
  { keywords: ['south africa','cape town','johannesburg','durban','kruger'],
    data: v('South Africa','Tourist Visa (Embassy)','7-10 working days','Action needed',['Passport (valid > 30 days after departure)','Visa application form','Biometrics at VFS Global','Bank statements (3 months)','Yellow fever cert (if transiting endemic country)','Return ticket + hotel booking'],'Apply via VFS Global. Biometrics appointment required in person.','https://www.vfsglobal.com/en/individuals/south-africa.html') },
]

export function getVisaInfo(destination: string): VisaEntry | null {
  const dest = destination.toLowerCase().trim()
  if (!dest) return null
  for (const entry of VISA_DB) {
    if (entry.keywords.some(kw => dest.includes(kw))) return entry.data
  }
  return {
    country: 'International Destination',
    visaStatus: 'Visa requirements vary — verify before booking',
    processingTime: '3-15 working days (estimated)',
    badge: 'Check required',
    badgeColor: '#EA580C', badgeBg: '#FFF7ED', badgeBorder: '#FED7AA',
    docs: ['Passport (valid > 6 months)', 'Return flight ticket', 'Accommodation booking', 'Sufficient funds'],
    caution: 'Always verify visa rules for Indian passport holders on the official embassy website before non-refundable bookings.',
    officialLink: 'https://www.vfsglobal.com/',
  }
}
