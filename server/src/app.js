const express = require('express');
const cors = require('cors');
const config = require('./config');
const db = require('./db');
const path = require('path');
const contactRoutes = require('./routes/contact');
const enquiryRoutes = require('./routes/enquiries');
const propertyRoutes = require('./routes/properties');
const adminRoutes = require('./routes/admin');
const helmet = require('helmet');
const limits = require('./middleware/limits');

const app = express();

app.disable('x-powered-by');
if (config.env === 'production') app.set('trust proxy', 1);
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
  origin: config.corsOrigin,
  methods: ['GET', 'POST', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 600
}));
app.use('/api', limits.api);
app.post('/api/contact', limits.forms);
app.post('/api/enquiries', limits.forms);
app.post('/api/properties', limits.forms);
app.post('/api/properties/:id/photos', limits.photos);
app.use('/api/properties/:id/photos', express.json({ limit: '600kb' }));
app.use(express.json({ limit: '100kb' }));

app.get('/api/health', async (req, res) => {
  try {
    await db.query('SELECT 1');
    res.json({ status: 'ok', database: 'up', time: new Date().toISOString() });
  } catch (err) {
    console.error('Health check: database unreachable');
    res.status(503).json({ status: 'error', database: 'down' });
  }
});

app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads'), {
  maxAge: '7d',
  setHeaders: (res) => res.set('X-Content-Type-Options', 'nosniff')
}));

app.use('/api/contact', contactRoutes);
app.use('/api/enquiries', enquiryRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/admin', adminRoutes);
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON' });
  }
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ error: 'Request too large' });
  }
  console.error(err);
  res.status(500).json({ error: 'Something went wrong' });
});
module.exports = app;