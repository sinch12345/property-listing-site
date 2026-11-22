const jwt = require('jsonwebtoken');
const config = require('../config');
const db = require('../db');

async function requireAdmin(req, res, next) {
  const header = req.get('Authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) return res.status(401).json({ error: 'Login required' });

  try {
    const payload = jwt.verify(token, config.jwtSecret, { algorithms: ['HS256'] });
    const admin = await db.query('SELECT id, email FROM admins WHERE id = $1', [payload.sub]);
    if (!admin.rowCount) return res.status(401).json({ error: 'Login required' });
    req.admin = admin.rows[0];
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Login required' });
    }
    next(err);
  }
}

module.exports = requireAdmin;