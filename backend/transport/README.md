# TripSage Transport Deep Link Service

This is a production-ready microservice built with **NestJS**, **TypeScript**, and **Swagger** that generates Uber deep links to locations in travel itineraries. It utilizes Dependency Injection, follows SOLID principles, and implements strict TypeScript schemas.

## 🚀 Features

- **Branded Uber Deep Linking:** Generates encoded, protocol-compliant Uber URLs without calling external Uber API endpoints.
- **Independent Train Booking Module:** Implements a decoupled Indian Railways (IRCTC) deep link builder that prefills search dates, stations, travel class, and quota.
- **Real-Time IRCTC Search & Retry:** Searches the requested itinerary date first. If empty, automatically falls back to search the next day. Hides the train module completely if no trains exist on either date.
- **AI Recommendation Engine:** Scores trains dynamically on Cheapest (lowest fare), Fastest (shortest duration), Morning Arrival, and Best Value criteria.
- **Search Caching & Scheduler:** Avoids duplicate calls with a 10-minute thread-safe caching service (`TrainCacheService`) coupled with a automatic eviction cleanup task runner (`TrainRefreshScheduler`).
- **Robust Validations:** Uses `class-validator` to ensure correct request parameters.
- **Decoupled Architecture:** Follows SOLID and dependency injection principles allowing alternate train data providers by implementing `TrainProvider`.
- **Swagger Documentation & Testing:** Auto-generated Swagger docs at `/docs` and 100% test coverage with Jest.

---

## 🛠️ Architecture and Folder Structure

```text
src/
├── app.controller.ts
├── app.module.ts
├── app.service.ts
├── main.ts
├── transport/
│   ├── dto/
│   │   └── create-uber-link.dto.ts
│   ├── interfaces/
│   │   └── transport-provider.interface.ts
│   ├── providers/
│   │   └── uber.provider.ts
│   ├── transport.controller.ts
│   ├── transport.module.ts
│   └── transport.service.ts
└── train/
    ├── dto/
    │   ├── train-search.dto.ts
    │   └── train-response.dto.ts
    ├── interfaces/
    │   └── train-provider.interface.ts
    ├── providers/
    │   └── irctc.provider.ts
    ├── train.cache.service.ts
    ├── train.controller.ts
    ├── train.module.ts
    ├── train.refresh-scheduler.ts
    ├── train.repository.ts
    ├── train.service.ts
    ├── train.service.spec.ts
    └── train.controller.spec.ts
```

- **`TrainProvider` Interface:** Formulates the blueprint for train searches.
- **`IrctcProvider`:** Resolves Indian cities to station codes (e.g., NDLS, MMCT, SBC) and builds official booking URLs.
- **`TrainRepository`:** Holds direct railway schedules and handles dynamic routing computations.
- **`TrainService`:** Handles search orchestration, next-day retries, and scoring.

---

## 💻 Setup and Execution

### 1. Install Dependencies
```bash
npm install
```

### 2. Run in Development Mode
```bash
npm run start:dev
```
The microservice starts on port `4001` (to prevent conflict with port `4000` on the main Express backend).

### 3. Swagger API Playground
Open your browser and navigate to:
[http://localhost:4001/docs](http://localhost:4001/docs)

---

## 🧪 Testing

Run Jest unit tests to verify parameters and URL encoding bounds:
```bash
npm run test
```

---

## 📝 API Integration Examples

### POST `/api/transport/uber`

#### Request Payload (DTO)
- `destinationName` (string, required): Name/Nickname of the place.
- `latitude` (number, required): Destination latitude (-90 to 90).
- `longitude` (number, required): Destination longitude (-180 to 180).
- `pickupType` (string, optional): Default: `my_location`.

#### Example Request (cURL)
```bash
curl -X POST http://localhost:4001/api/transport/uber \
  -H "Content-Type: application/json" \
  -d '{
    "destinationName": "Bangalore Palace",
    "latitude": 12.9987,
    "longitude": 77.5921
  }'
```

#### Successful Response (Status Code: 200)
```json
{
  "provider": "Uber",
  "url": "https://m.uber.com/ul/?action=setPickup&pickup=my_location&dropoff[latitude]=12.9987&dropoff[longitude]=77.5921&dropoff[nickname]=Bangalore%20Palace",
  "destination": "Bangalore Palace",
  "latitude": 12.9987,
  "longitude": 77.5921
}
```

#### Validation Error (Status Code: 400)
If latitude or longitude limits are breached (e.g. latitude `100`), the microservice returns:
```json
{
  "statusCode": 400,
  "message": [
    "latitude must not be greater than 90"
  ],
  "error": "Bad Request"
}
```
