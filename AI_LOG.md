# AI Log

## AI Usage

AI was used as an assistant during the development of the Campus Equipment Booking API.

The AI was used for:

- Understanding the API requirements
- Designing the API endpoint structure
- Explaining Hono and Cloudflare D1 usage
- Designing the database schema
- Designing the booking overlap validation
- Debugging PowerShell and cURL commands
- Reviewing HTTP status codes and validation
- Reviewing the project documentation

## Important Technical Decision

The booking overlap rule was implemented as:

```text
existing.startAt < new.endAt
AND
existing.endAt > new.startAt
```

This rule is applied only to bookings for the same equipment.

It prevents overlapping bookings while allowing a new booking to start exactly when another booking ends.

## Validation

The API validates:

- Required fields
- Valid start and end timestamps
- `startAt` must be before `endAt`
- `equipmentId` must exist
- Overlapping bookings are rejected

## SQL Security

AI suggested using parameter binding for SQL queries.

I verified that the implementation uses D1 parameter binding with `.bind()` and does not concatenate request data directly into SQL.

Example:

```ts
.prepare('SELECT * FROM bookings WHERE id = ?')
.bind(id)
```

## Debugging

AI was used to help debug PowerShell cURL commands.

One issue occurred because multiple commands were accidentally combined into one command. The command was corrected and the deployed API was tested successfully.

## Verification

I verified the API myself using cURL against the deployed Cloudflare Workers API:

```text
https://midterm-api.nuttida.workers.dev
```

The tests included:

- GET `/equipment`
- POST `/bookings`
- GET `/bookings/:id`
- GET `/bookings`
- Overlapping booking
- Invalid time
- Invalid equipment
- PATCH `/bookings/:id`
- DELETE `/bookings/:id`
- GET deleted booking

I checked the returned HTTP status codes and JSON responses myself.

## Ownership

I understand the main implementation decisions, including:

- Why `400` is used for invalid input
- Why `404` is used when a resource does not exist
- Why `409` is used for booking conflicts
- How the overlap condition works
- How D1 parameter binding protects SQL queries
- How the CRUD endpoints interact with the database
