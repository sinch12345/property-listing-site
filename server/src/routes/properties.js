const express = require('express');
const { z } = require('zod');
const db = require('../db');

const router = express.Router();

const LOCATIONS = ['Lakeside', 'Old Town', 'Hillcrest', 'Harbour'];
const TYPES = ['Apartment', 'Villa', 'Townhouse', 'Studio'];
const VIBES = ['Sunlit mornings', 'Quiet street', 'Work-from-home ready', 'Pet friendly', 'Great for hosting'];

const SORTS = {
  newest: 'p.created_at DESC',
  priceLow: 'p.price ASC',
  priceHigh: 'p.price DESC'
};

const SELECT = `
  SELECT p.id, p.title, n.name AS location, p.type, p.price, p.beds, p.baths, p.area,
         p.created_at AS added,
         COALESCE((SELECT array_agg(v.vibe ORDER BY v.vibe)
                   FROM property_vibes v WHERE v.property_id = p.id), '{}') AS vibes
  FROM properties p
  JOIN neighborhoods n ON n.id = p.neighborhood_id`;

function shape(r) {
  return {
    id: Number(r.id),
    title: r.title,
    location: r.location,
    type: r.type,
    price: r.price,
    beds: r.beds,
    baths: r.baths,
    area: r.area,
    vibes: r.vibes,
    added: r.added
  };
}

const listSchema = z.object({
  location: z.enum(LOCATIONS).optional(),
  type: z.enum(TYPES).optional(),
  vibe: z.enum(VIBES).optional(),
  maxPrice: z.coerce.number().int().positive().optional(),
  beds: z.coerce.number().int().min(1).max(10).optional(),
  baths: z.coerce.number().int().min(1).max(10).optional(),
  sort: z.enum(['newest', 'priceLow', 'priceHigh']).default('newest'),
  limit: z.coerce.number().int().min(1).max(100).default(50)
});

router.get('/', async (req, res, next) => {
  const parsed = listSchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid filters' });
  }
  const q = parsed.data;

  const where = ["p.status = 'approved'"];
  const params = [];
  const add = (sql, value) => { params.push(value); where.push(sql.replace('?', '$' + params.length)); };

  if (q.location) add('n.name = ?', q.location);
  if (q.type) add('p.type = ?', q.type);
  if (q.maxPrice) add('p.price <= ?', q.maxPrice);
  if (q.beds) add('p.beds >= ?', q.beds);
  if (q.baths) add('p.baths >= ?', q.baths);
  if (q.vibe) add('EXISTS (SELECT 1 FROM property_vibes v WHERE v.property_id = p.id AND v.vibe = ?)', q.vibe);

  params.push(q.limit);
  const sql = SELECT + ' WHERE ' + where.join(' AND ') +
    ' ORDER BY ' + SORTS[q.sort] + ' LIMIT $' + params.length;

  try {
    const result = await db.query(sql, params);
    res.json({ count: result.rowCount, homes: result.rows.map(shape) });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({ error: 'Invalid id' });
  }
  try {
    const result = await db.query(SELECT + " WHERE p.id = $1 AND p.status = 'approved'", [id]);
    if (!result.rowCount) return res.status(404).json({ error: 'Home not found' });
    res.json(shape(result.rows[0]));
  } catch (err) {
    next(err);
  }
});

const createSchema = z.object({
  title: z.string().trim().min(3, 'Title is too short').max(100),
  location: z.enum(LOCATIONS),
  type: z.enum(TYPES),
  price: z.coerce.number().int().min(1).max(100000000),
  beds: z.coerce.number().int().min(1).max(10),
  baths: z.coerce.number().int().min(1).max(10),
  area: z.coerce.number().int().min(1).max(100000),
  vibes: z.array(z.enum(VIBES)).max(3, 'Pick up to 3 vibes').default([]),
  ownerName: z.string().trim().min(1, 'Name is required').max(100),
  ownerEmail: z.string().trim().toLowerCase().email('Enter a valid email').max(254)
});

router.post('/', async (req, res, next) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    const fields = {};
    parsed.error.issues.forEach((i) => { fields[i.path[0]] = i.message; });
    return res.status(400).json({ error: 'Invalid input', fields });
  }
  const h = parsed.data;
  const vibes = [...new Set(h.vibes)];

  const client = await db.connect();
  try {
    await client.query('BEGIN');

    const dup = await client.query(
      `SELECT 1 FROM properties
       WHERE owner_email = $1 AND title = $2 AND created_at > now() - interval '10 minutes'`,
      [h.ownerEmail, h.title]
    );
    if (dup.rowCount) {
      await client.query('ROLLBACK');
      return res.status(409).json({ error: 'You already submitted this listing.' });
    }

    const row = await client.query(
      `INSERT INTO properties
         (title, neighborhood_id, type, price, beds, baths, area, owner_name, owner_email)
       VALUES ($1, (SELECT id FROM neighborhoods WHERE name = $2), $3, $4, $5, $6, $7, $8, $9)
       RETURNING id`,
      [h.title, h.location, h.type, h.price, h.beds, h.baths, h.area, h.ownerName, h.ownerEmail]
    );
    for (const vibe of vibes) {
      await client.query('INSERT INTO property_vibes (property_id, vibe) VALUES ($1, $2)', [row.rows[0].id, vibe]);
    }

    await client.query('COMMIT');
    res.status(201).json({
      id: Number(row.rows[0].id),
      status: 'pending',
      message: 'Thank you! Your listing will go live after our team reviews it.'
    });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
});

module.exports = router;