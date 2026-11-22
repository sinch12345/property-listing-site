const rateLimit = require('express-rate-limit');

const FIFTEEN_MIN = 15 * 60 * 1000;

function make(limit, extra = {}) {
  return rateLimit({
    windowMs: FIFTEEN_MIN,
    limit,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({ error: 'Too many requests. Please wait a few minutes and try again.' });
    },
    ...extra
  });
}

module.exports = {
  api: make(300),
  forms: make(10),
  photos: make(60),
  login: make(5, { skipSuccessfulRequests: true })
};