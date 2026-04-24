# 🌍 TripSage — AI-Powered Travel Operating System

![TripSage](https://res.cloudinary.com/dob5llmb2/image/upload/v1774999435/LOGO_xbwcwe.png)

> Real-time AI travel OS. Plan → Book → Navigate → Explore → Support → Monetize.

---

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 14 (App Router), React, TypeScript, Tailwind CSS |
| **State** | Zustand |
| **Backend** | Node.js + Express |
| **Real-time** | Socket.IO |
| **Database** | MongoDB Atlas |
| **Cache** | Redis Cloud |
| **AI** | Groq (LLaMA3-70B) |
| **Travel APIs** | RapidAPI (Flights, Hotels, Activities, Buses) |
| **Images** | Unsplash + Google Places |
| **Weather** | OpenWeatherMap |
| **Deployment** | Vercel (frontend) + Railway/Render (backend) |

---

## 📁 Project Structure

```
tripsage/
├── frontend/               # Next.js App
│   ├── app/
│   │   ├── page.tsx        # Landing page
│   │   ├── plan/           # Main trip dashboard
│   │   ├── support/        # Support page
│   │   └── globals.css
│   ├── components/
│   │   ├── transport/      # Flight cards
│   │   ├── hotel/          # Hotel cards
│   │   ├── itinerary/      # Day-by-day planner
│   │   ├── weather/        # Live weather widget
│   │   ├── notifications/  # Real-time alerts panel
│   │   ├── explore/        # Activities & restaurants
│   │   ├── map/            # Leaflet map view
│   │   └── booking/        # Booking state machine
│   ├── store/              # Zustand global state
│   ├── hooks/              # useSocket, custom hooks
│   └── lib/                # API client, utils, affiliates
│
├── backend/                # Express + Socket.IO
│   ├── src/
│   │   ├── index.js        # Server entry + middleware
│   │   ├── routes/         # REST API routes
│   │   └── services/
│   │       ├── aiService.js      # Groq LLaMA3 integration
│   │       ├── travelService.js  # Flights + Hotels (RapidAPI)
│   │       ├── weatherService.js # OpenWeatherMap
│   │       └── socketService.js  # Real-time engine
│   └── config/
│       ├── database.js     # MongoDB
│       └── redis.js        # Redis caching
│
├── docker-compose.yml
└── README.md
```

---

## ⚡ Quick Start

### 1. Clone & Install

```bash
# Install frontend deps
cd frontend && npm install

# Install backend deps
cd ../backend && npm install
```

### 2. Configure Environment Variables

**Frontend** — copy `frontend/.env.local.example` → `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_SOCKET_URL=http://localhost:4000
NEXT_PUBLIC_GOOGLE_MAPS_KEY=your_key
NEXT_PUBLIC_UNSPLASH_KEY=your_key
```

**Backend** — copy `backend/.env.example` → `backend/.env`:
```env
PORT=4000
DB_URL=mongodb+srv://...
REDIS_URL=redis://localhost:6379
GROQ_API_KEY=gsk_...
RAPIDAPI_KEY=your_rapidapi_key
RAPIDAPI_HOST_FLIGHTS=sky-scrapper.p.rapidapi.com
RAPIDAPI_HOST_HOTELS=hotels4.p.rapidapi.com
WEATHER_API_KEY=your_openweather_key
AFFILIATE_ID_HOTELS=2311539
```

### 3. Run Locally

```bash
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Frontend
cd frontend && npm run dev
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:4000
- Health check: http://localhost:4000/health

### 4. Run with Docker

```bash
# Copy env file
cp backend/.env.example backend/.env
# Fill in your keys, then:

docker-compose up --build
```

---

## 🔑 Required API Keys

| Service | URL | Free Tier |
|---|---|---|
| **Groq (AI)** | https://console.groq.com | ✅ 6000 req/min |
| **RapidAPI** | https://rapidapi.com | ✅ Limited |
| **OpenWeatherMap** | https://openweathermap.org/api | ✅ 1000/day |
| **MongoDB Atlas** | https://cloud.mongodb.com | ✅ 512MB |
| **Redis Cloud** | https://redis.com | ✅ 30MB |
| **Unsplash** | https://unsplash.com/developers | ✅ 50 req/hr |

> **Note:** The app runs in **DEMO mode** with mock data if API keys are missing. No crashes.

---

## 🧠 AI Engine (Groq)

TripSage uses **Groq LLaMA3-70B** for:
- Day-by-day itinerary generation
- Personalized recommendations
- Travel tips based on style/budget

**Ranking Score Formula:**
```
score = (0.4 × affordability) + (0.3 × rating) + (0.3 × relevance)
```

---

## ⚡ Real-time Features (Socket.IO)

| Event | Description |
|---|---|
| `PRICE_UPDATE` | Live flight/hotel price drops |
| `WEATHER_ALERT` | Destination weather warnings |
| `BOOKING_UPDATE` | Booking confirmation status |
| `LOCATION_ALERT` | Nearby attraction notifications |
| `SYSTEM_STATUS` | Heartbeat & session management |

---

## 💰 Affiliate Links

| Partner | Platform |
|---|---|
| Flights | Skyscanner |
| Hotels | Booking.com |
| Activities | Viator |
| Buses | RedBus |
| Cars | DiscoverCars |

---

## 🚀 Deployment

### Frontend → Vercel
```bash
cd frontend
npx vercel --prod
```

### Backend → Railway
```bash
cd backend
railway up
```

### Backend → Render
- Connect GitHub repo
- Set root to `backend/`
- Add all env vars in dashboard

---

## ⚖️ Terms & Conditions

- Prices and availability may change in real time
- TripSage does **NOT** guarantee final booking price
- Bookings are handled by **third-party providers**
- TripSage is **NOT** responsible for cancellations or delays
- Affiliate links may generate commission
- User must verify travel documents and regulations
- Minimal data storage policy enforced
- No resale of personal data
- TripSage is a **recommendation system**, not a travel operator

---

## 📞 Support

- Email: support@tripsage.ai
- Website: https://tripsage.ai

---

*Built with ❤️ — TripSage AI Travel OS v2.0*
