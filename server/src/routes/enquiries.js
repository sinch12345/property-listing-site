const express = require('express');
const { z } = require('zod');
const db = require('../db');

const router = express.Router();

const enquirySchema = z.object({
  propertyId: z.coerce.number().int().positive(),
  name: z.string().trim().min(1, 'Name is required').max(100),
  email: z.string().trim().toLowerCase().email('Enter a valid email').max(254),
  message: z.string().trim().min(1, 'Message is required').max(2000)
});

router.post('/', async (req, res, next) => {
  const parsed = enquirySchema.safeParse(req.body);
  if (!parsed.success) {
    const fields = {};
    parsed.error.issues.forEach((i) => { fields[i.path[0]] = i.message; });
    return res.status(400).json({ error: 'Invalid input', fields });
  }

  const { propertyId, name, email, message } = parsed.data;
  try {
    const home = await db.query(
      "SELECT 1 FROM properties WHERE id = $1 AND status = 'approved'",
      [propertyId]
    );
    if (!home.rowCount) {
      return res.status(404).json({ error: 'Home not found' });
    }

    const result = await db.query(
      'INSERT INTO enquiries (property_id, name, email, message) VALUES ($1, $2, $3, $4) RETURNING id',
      [propertyId, name, email, message]
    );
    res.status(201).json({ id: result.rows[0].id, message: 'Thank you, we will be in touch.' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;