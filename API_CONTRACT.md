# API Contract

## Base URL

https://midterm-api.nuttida.workers.dev

---

## 1. Equipment

### GET /equipment

Returns all equipment.

### Success

Status:

```text
200 OK
```

Example:

```json
[
  {
    "id": "eq-1",
    "name": "Projector A",
    "location": "Building 1"
  },
  {
    "id": "eq-2",
    "name": "Camera A",
    "location": "Building 2"
  }
]
```

---

# 2. Bookings

## GET /bookings

Returns all bookings.

### Success

```text
200 OK
```

---

## GET /bookings/:id

Returns one booking by ID.

### Success

```text
200 OK
```

### Not Found

```text
404 Not Found
```

Response:

```json
{
  "error": "Booking not found"
}
```

---

## POST /bookings

Creates a new booking.

### Request

```json
{
  "equipmentId": "eq-1",
  "borrowerName": "Somchai Jaidee",
  "startAt": "2026-10-20T09:00:00.000Z",
  "endAt": "2026-10-20T11:00:00.000Z",
  "purpose": "Class presentation"
}
```

### Success

```text
201 Created
```

Example response:

```json
{
  "id": "booking-id",
  "equipmentId": "eq-1",
  "borrowerName": "Somchai Jaidee",
  "startAt": "2026-10-20T09:00:00.000Z",
  "endAt": "2026-10-20T11:00:00.000Z",
  "purpose": "Class presentation"
}
```

### Invalid Data

```text
400 Bad Request
```

Example:

```json
{
  "error": "startAt must be before endAt"
}
```

### Equipment Not Found

```text
404 Not Found
```

Example:

```json
{
  "error": "Equipment not found"
}
```

### Booking Conflict

```text
409 Conflict
```

Example:

```json
{
  "error": "This equipment is already booked during this time"
}
```

---

## PATCH /bookings/:id

Updates an existing booking.

### Request

```json
{
  "equipmentId": "eq-1",
  "borrowerName": "Nuttida Updated",
  "startAt": "2026-10-20T13:00:00.000Z",
  "endAt": "2026-10-20T15:00:00.000Z",
  "purpose": "Updated class presentation"
}
```

### Success

```text
200 OK
```

### Booking Not Found

```text
404 Not Found
```

### Invalid Data

```text
400 Bad Request
```

### Booking Conflict

```text
409 Conflict
```

---

## DELETE /bookings/:id

Deletes a booking.

### Success

```text
204 No Content
```

### Booking Not Found

```text
404 Not Found
```

Response:

```json
{
  "error": "Booking not found"
}
```

---

# Validation Rules

## Required Fields

The following fields are required:

- `equipmentId`
- `borrowerName`
- `startAt`
- `endAt`
- `purpose`

Missing required fields return:

```text
400 Bad Request
```

## Time Validation

The API checks that:

```text
startAt < endAt
```

Invalid time ranges return:

```text
400 Bad Request
```

## Equipment Validation

`equipmentId` must exist in the `equipment` table.

If it does not exist:

```text
404 Not Found
```

## Overlap Validation

For the same equipment, a booking conflicts when:

```text
existing.startAt < new.endAt
AND
existing.endAt > new.startAt
```

A conflict returns:

```text
409 Conflict
```

---

# SQL Security

All user-provided values are passed using parameter binding.

Example:

```ts
.prepare('SELECT * FROM bookings WHERE id = ?')
.bind(id)
```

Request data is not concatenated directly into SQL statements.

---

# Status Code Summary

| Status | Usage |
|---:|---|
| 200 | Successful GET/PATCH |
| 201 | Successful POST |
| 204 | Successful DELETE |
| 400 | Invalid or missing data |
| 404 | Resource not found |
| 409 | Booking conflict |
