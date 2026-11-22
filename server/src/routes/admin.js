const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { z } = require('zod');
const config = require('../config');
const db = require('../db');
const requireAdmin = require('../middleware/auth');
const limits = require('../middleware/limits');

const router = express.Router();
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', 12);

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  password: z.string().min(1).max(200)
});

router.post('/login', async (req, res, next) => {  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  try {
    const found = await db.query('SELECT id, password_hash FROM admins WHERE email = $1', [parsed.data.email]);
    const hash = found.rowCount ? found.rows[0].password_hash : DUMMY_HASH;
    const ok = await bcrypt.compare(parsed.data.password, hash);
    if (!found.rowCount || !ok) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const token = jwt.sign({ sub: found.rows[0].id }, config.jwtSecret, { algorithm: 'HS256', expiresIn: '2h' });
    res.json({ token, expiresIn: 7200 });
  } catch (err) {
    next(err);
  }
});

router.use(requireAdmin);

router.get('/me', (req, res) => {
  res.json({ email: req.admin.email });
});

const pageSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0)
});

const statusSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected']).default('pending')
});

router.get('/properties', async (req, res, next) => {
  const page = pageSchema.safeParse(req.query);
  const filter = statusSchema.safeParse(req.query);
  if (!page.success || !filter.success) return res.status(400).json({ error: 'Invalid query' });
  try {
    const result = await db.query(
      `SELECT p.id, p.title, n.name AS location, p.type, p.price, p.beds, p.baths, p.area,
              p.status, p.owner_name, p.owner_email, p.created_at,
              COALESCE((SELECT array_agg(v.vibe ORDER BY v.vibe)
                        FROM property_vibes v WHERE v.property_id = p.id), '{}') AS vibes,
              COALESCE((SELECT array_agg('/uploads/' || f.file ORDER BY f.position)
                        FROM property_photos f WHERE f.property_id = p.id), '{}') AS photos
       FROM properties p JOIN neighborhoods n ON n.id = p.neighborhood_id
       WHERE p.status = $1
       ORDER BY p.created_at DESC LIMIT $2 OFFSET $3`,
      [filter.data.status, page.data.limit, page.data.offset]
    );
    res.json({ count: result.rowCount, homes: result.rows.map((r) => ({ ...r, id: Number(r.id) })) });
  } catch (err) {
    next(err);
  }
});

router.patch('/properties/:id', async (req, res, next) => {
  const id = Number(req.params.id);
  const parsed = z.object({ status: z.enum(['approved', 'rejected']) }).safeParse(req.body);
  if (!Number.isInteger(id) || id < 1 || !parsed.success) {
    return res.status(400).json({ error: 'Invalid input' });
  }
  try {
    const result = await db.query(
      'UPDATE properties SET status = $1 WHERE id = $2 RETURNING id, status',
      [parsed.data.status, id]
    );
    if (!result.rowCount) return res.status(404).json({ error: 'Home not found' });
    res.json({ id: Number(result.rows[0].id), status: result.rows[0].status });
  } catch (err) {
    next(err);
  }
});

router.get('/enquiries', async (req, res, next) => {
  const page = pageSchema.safeParse(req.query);
  if (!page.success) return res.status(400).json({ error: 'Invalid query' });
  try {
    const result = await db.query(
      `SELECT e.id, e.property_id, p.title AS property_title, e.name, e.email, e.message, e.created_at
       FROM enquiries e JOIN properties p ON p.id = e.property_id
       ORDER BY e.created_at DESC LIMIT $1 OFFSET $2`,
      [page.data.limit, page.data.offset]
    );
    res.json({ count: result.rowCount, enquiries: result.rows.map((r) => ({ ...r, id: Number(r.id), property_id: Number(r.property_id) })) });
  } catch (err) {
    next(err);
  }
});

router.get('/contact-messages', async (req, res, next) => {
  const page = pageSchema.safeParse(req.query);
  if (!page.success) return res.status(400).json({ error: 'Invalid query' });
  try {
    const result = await db.query(
      `SELECT id, name, email, topic, message, created_at
       FROM contact_messages ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
      [page.data.limit, page.data.offset]
    );
    res.json({ count: result.rowCount, messages: result.rows.map((r) => ({ ...r, id: Number(r.id) })) });
  } catch (err) {
    next(err);
  }
});

module.exports = router;