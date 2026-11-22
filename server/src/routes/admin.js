const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { z } = require('zod');
const config = require('../config');
const db = require('../db');
const requireAdmin = require('../middleware/auth');

const router = express.Router();
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', 12);

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  password: z.string().min(1).max(200)
});

router.post('/login', async (req, res, next) => {
  const parsed = loginSchema.safeParse(req.body);
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

module.exports = router;