import { Hono } from 'hono'

type Bindings = {
  midterm_db: D1Database
}

const app = new Hono<{ Bindings: Bindings }>()

// GET /equipment
app.get('/equipment', async (c) => {
  const { results } = await c.env.midterm_db
    .prepare('SELECT * FROM equipment ORDER BY id')
    .all()

  return c.json(results, 200)
})

// GET /bookings
app.get('/bookings', async (c) => {
  const { results } = await c.env.midterm_db
    .prepare('SELECT * FROM bookings ORDER BY startAt')
    .all()

  return c.json(results, 200)
})

// GET /bookings/:id
app.get('/bookings/:id', async (c) => {
  const id = c.req.param('id')

  const booking = await c.env.midterm_db
    .prepare('SELECT * FROM bookings WHERE id = ?')
    .bind(id)
    .first()

  if (!booking) {
    return c.json({ error: 'Booking not found' }, 404)
  }

  return c.json(booking, 200)
})

// POST /bookings
app.post('/bookings', async (c) => {
  const body = await c.req.json()

  const {
    equipmentId,
    borrowerName,
    startAt,
    endAt,
    purpose
  } = body

  // Required fields
  if (!equipmentId || !borrowerName || !startAt || !endAt || !purpose) {
    return c.json({ error: 'All fields are required' }, 400)
  }

  const start = new Date(startAt)
  const end = new Date(endAt)

  // Validate date
  if (
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime()) ||
    start >= end
  ) {
    return c.json(
      { error: 'startAt must be before endAt' },
      400
    )
  }

  // Check equipment exists
  const equipment = await c.env.midterm_db
    .prepare('SELECT id FROM equipment WHERE id = ?')
    .bind(equipmentId)
    .first()

  if (!equipment) {
    return c.json({ error: 'Equipment not found' }, 404)
  }

  // Check overlapping booking
  const conflict = await c.env.midterm_db
    .prepare(`
      SELECT id
      FROM bookings
      WHERE equipmentId = ?
      AND startAt < ?
      AND endAt > ?
    `)
    .bind(equipmentId, endAt, startAt)
    .first()

  if (conflict) {
    return c.json(
      { error: 'This equipment is already booked during this time' },
      409
    )
  }

  const id = crypto.randomUUID()

  await c.env.midterm_db
    .prepare(`
      INSERT INTO bookings
      (id, equipmentId, borrowerName, startAt, endAt, purpose)
      VALUES (?, ?, ?, ?, ?, ?)
    `)
    .bind(
      id,
      equipmentId,
      borrowerName,
      startAt,
      endAt,
      purpose
    )
    .run()

  const booking = await c.env.midterm_db
    .prepare('SELECT * FROM bookings WHERE id = ?')
    .bind(id)
    .first()

  return c.json(booking, 201)
})

// PATCH /bookings/:id
app.patch('/bookings/:id', async (c) => {
  const id = c.req.param('id')
  const body = await c.req.json()

  const {
    equipmentId,
    borrowerName,
    startAt,
    endAt,
    purpose
  } = body

  if (!equipmentId || !borrowerName || !startAt || !endAt || !purpose) {
    return c.json({ error: 'All fields are required' }, 400)
  }

  const start = new Date(startAt)
  const end = new Date(endAt)

  if (
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime()) ||
    start >= end
  ) {
    return c.json(
      { error: 'startAt must be before endAt' },
      400
    )
  }

  // Check booking exists
  const existing = await c.env.midterm_db
    .prepare('SELECT id FROM bookings WHERE id = ?')
    .bind(id)
    .first()

  if (!existing) {
    return c.json({ error: 'Booking not found' }, 404)
  }

  // Check equipment exists
  const equipment = await c.env.midterm_db
    .prepare('SELECT id FROM equipment WHERE id = ?')
    .bind(equipmentId)
    .first()

  if (!equipment) {
    return c.json({ error: 'Equipment not found' }, 404)
  }

  // Check overlapping booking, excluding current booking
  const conflict = await c.env.midterm_db
    .prepare(`
      SELECT id
      FROM bookings
      WHERE equipmentId = ?
      AND id != ?
      AND startAt < ?
      AND endAt > ?
    `)
    .bind(equipmentId, id, endAt, startAt)
    .first()

  if (conflict) {
    return c.json(
      { error: 'This equipment is already booked during this time' },
      409
    )
  }

  await c.env.midterm_db
    .prepare(`
      UPDATE bookings
      SET equipmentId = ?,
          borrowerName = ?,
          startAt = ?,
          endAt = ?,
          purpose = ?
      WHERE id = ?
    `)
    .bind(
      equipmentId,
      borrowerName,
      startAt,
      endAt,
      purpose,
      id
    )
    .run()

  const booking = await c.env.midterm_db
    .prepare('SELECT * FROM bookings WHERE id = ?')
    .bind(id)
    .first()

  return c.json(booking, 200)
})

// DELETE /bookings/:id
app.delete('/bookings/:id', async (c) => {
  const id = c.req.param('id')

  const result = await c.env.midterm_db
    .prepare('DELETE FROM bookings WHERE id = ?')
    .bind(id)
    .run()

  if (!result.meta.changes) {
    return c.json({ error: 'Booking not found' }, 404)
  }

  return c.body(null, 204)
})

app.get('/', (c) => {
  return c.text('Campus Equipment Booking API')
})

export default app