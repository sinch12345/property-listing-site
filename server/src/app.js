const express = require('express');
const cors = require('cors');
const config = require('./config');
const db = require('./db');
const contactRoutes = require('./routes/contact');

const app = express();

app.disable('x-powered-by');
app.use(cors({ origin: config.corsOrigin }));
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

app.use('/api/contact', contactRoutes);
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Something went wrong' });
});

module.exports = app;