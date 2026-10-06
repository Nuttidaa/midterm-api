
# Campus Equipment Booking API

A REST API for booking shared campus equipment such as projectors and cameras.

The system prevents the same equipment from being booked during overlapping time periods.

## Base API URL

https://midterm-api.nuttida.workers.dev

## Tech Stack

- TypeScript
- Hono
- Cloudflare Workers
- Cloudflare D1
- SQLite
- Wrangler
- cURL for API testing

## Features

- List available equipment
- Create equipment bookings
- View all bookings
- View a booking by ID
- Update a booking
- Delete a booking
- Validate booking time
- Validate equipment existence
- Prevent overlapping bookings

---

## API Endpoints

| Method | Endpoint | Success | Description |
|---|---|---:|---|
| GET | `/equipment` | 200 | Get all equipment |
| GET | `/bookings` | 200 | Get all bookings |
| GET | `/bookings/:id` | 200 | Get one booking |
| POST | `/bookings` | 201 | Create a booking |
| PATCH | `/bookings/:id` | 200 | Update a booking |
| DELETE | `/bookings/:id` | 204 | Delete a booking |

---

## Create / Update Booking

Request body:

```json
{
  "equipmentId": "eq-1",
  "borrowerName": "Somchai Jaidee",
  "startAt": "2026-10-20T09:00:00.000Z",
  "endAt": "2026-10-20T11:00:00.000Z",
  "purpose": "Class presentation"
}
```

## Validation Rules

1. All required fields must be provided.
2. `equipmentId` must exist in the equipment table.
3. `startAt` and `endAt` must be valid dates.
4. `startAt` must be before `endAt`.
5. The same equipment cannot have overlapping bookings.
6. SQL queries use parameter binding.

## HTTP Error Status Codes

| Status | Meaning |
|---:|---|
| 400 | Missing or invalid data |
| 404 | Resource not found |
| 409 | Booking time conflict |

All error responses use:

```json
{
  "error": "Error message"
}
```

---

## Database Schema

### Equipment

| Column | Type | Description |
|---|---|---|
| id | TEXT | Primary key |
| name | TEXT | Equipment name |
| location | TEXT | Equipment location |

### Bookings

| Column | Type | Description |
|---|---|---|
| id | TEXT | Primary key |
| equipmentId | TEXT | References equipment.id |
| borrowerName | TEXT | Name of borrower |
| startAt | TEXT | Booking start time |
| endAt | TEXT | Booking end time |
| purpose | TEXT | Booking purpose |

### Relationship

```text
equipment
   |
   | 1
   |
   | N
bookings
```

One equipment item can have many bookings.

---

## Booking Overlap Rule

A new booking conflicts with an existing booking when:

```text
existing.startAt < new.endAt
AND
existing.endAt > new.startAt
```

The check is performed for the same `equipmentId`.

This allows one booking to start exactly when another booking ends.

---

## SQL Security

The API uses D1 parameter binding with `.bind()`.

Example:

```ts
.prepare('SELECT * FROM bookings WHERE id = ?')
.bind(id)
```

Request data is not concatenated directly into SQL statements.

---

## Run Locally

Install dependencies:

```bash
npm install
```

Apply the local database schema:

```bash
npx wrangler d1 execute midterm-db --local --file=./schema.sql
```

Start the development server:

```bash
npm run dev
```

The local API runs on:

```text
http://localhost:8787
```

## Deploy

```bash
npx wrangler deploy
```

Production API:

```text
https://midterm-api.nuttida.workers.dev
```

---

## Test Evidence

Tests were performed against the deployed API using cURL.

| # | Test Case | Method | Endpoint | Expected |
|---|---|---|---|---:|
| 1 | List equipment | GET | `/equipment` | 200 |
| 2 | Create booking | POST | `/bookings` | 201 |
| 3 | Get booking | GET | `/bookings/:id` | 200 |
| 4 | List bookings | GET | `/bookings` | 200 |
| 5 | Overlapping booking | POST | `/bookings` | 409 |
| 6 | Invalid time | POST | `/bookings` | 400 |
| 7 | Invalid equipment | POST | `/bookings` | 404 |
| 8 | Update booking | PATCH | `/bookings/:id` | 200 |
| 9 | Delete booking | DELETE | `/bookings/:id` | 204 |
| 10 | Get deleted booking | GET | `/bookings/:id` | 404 |

---

## Project Structure

```text
midterm-api/
├── README.md
├── API_CONTRACT.md
├── AI_LOG.md
├── QUALITY_GATE_REVIEW.md
├── schema.sql
├── package.json
├── wrangler.jsonc
└── src/
    └── index.ts
```
