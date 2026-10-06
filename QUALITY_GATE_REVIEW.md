# Quality Gate Review

## Finding 1 — Reliability / Accuracy

### What I found

The API must prevent the same equipment from being booked during overlapping time periods.

Without an overlap check, two users could book the same equipment at the same time.

### How I fixed it

I added an overlap check before creating and updating a booking.

The condition is:

```text
existing.startAt < new.endAt
AND
existing.endAt > new.startAt
```

The check also verifies that the booking belongs to the same equipment.

### Evidence

I tested creating another booking for `eq-1` during an existing booking period.

The API returned:

```text
409 Conflict
```

with:

```json
{
  "error": "This equipment is already booked during this time"
}
```

---

## Finding 2 — Validation

### What I found

Invalid booking times could create incorrect booking data.

For example, `startAt` could be later than `endAt`.

### How I fixed it

I added validation to check that:

```text
startAt < endAt
```

Invalid timestamps and invalid time ranges return HTTP 400.

### Evidence

I sent a request where:

```text
startAt = 15:00
endAt = 13:00
```

The API returned:

```text
400 Bad Request
```

with:

```json
{
  "error": "startAt must be before endAt"
}
```

---

## Finding 3 — Security

### What I found

Request data should not be directly concatenated into SQL queries.

Direct SQL string construction could create a SQL injection risk.

### How I fixed it

I used D1 parameter binding with `.bind()` for request values.

Example:

```ts
.prepare('SELECT * FROM bookings WHERE id = ?')
.bind(id)
```

### Evidence

The API implementation uses SQL placeholders and parameter binding for booking and equipment queries.

---

## Finding 4 — Error Handling

### What I found

Different types of errors need different HTTP status codes so that API clients can understand the result.

### How I fixed it

I used:

- `400` for invalid or missing input
- `404` when a booking or equipment does not exist
- `409` when a booking overlaps an existing booking

### Evidence

I tested:

- Invalid time → `400`
- Invalid equipment → `404`
- Overlapping booking → `409`
- Deleted booking lookup → `404`

---

## Finding 5 — Reasoning / You Own It

### What I found

The API behavior and status codes need to be understandable and explainable, not just implemented.

### How I fixed it

I reviewed the implementation and verified the reason for each important decision:

- `400` means the request data is invalid.
- `404` means the requested resource does not exist.
- `409` means the requested booking conflicts with an existing booking.
- The overlap formula checks both start and end times.
- Parameter binding is used for SQL request values.

### Evidence

I tested the deployed API using cURL and verified the returned status codes and JSON responses myself.

The deployed API is:

```text
https://midterm-api.nuttida.workers.dev
```
