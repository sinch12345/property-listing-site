const express = require('express');
const { z } = require('zod');
const db = require('../db');

const router = express.Router();

const contactSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100),
  email: z.string().trim().toLowerCase().email('Enter a valid email').max(254),
  topic: z.enum(['Buying a home', 'Listing a property', 'Something else']),
  message: z.string().trim().min(1, 'Message is required').max(2000)
});

router.post('/', async (req, res, next) => {
  const parsed = contactSchema.safeParse(req.body);
  if (!parsed.success) {
    const fields = {};
    parsed.error.issues.forEach((i) => { fields[i.path[0]] = i.message; });
    return res.status(400).json({ error: 'Invalid input', fields });
  }

  const { name, email, topic, message } = parsed.data;
  try {
    const result = await db.query(
      'INSERT INTO contact_messages (name, email, topic, message) VALUES ($1, $2, $3, $4) RETURNING id',
      [name, email, topic, message]
    );
    res.status(201).json({ id: result.rows[0].id, message: 'Thank you, we will reply soon.' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;