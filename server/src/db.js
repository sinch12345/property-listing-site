const { Pool } = require('pg');
const config = require('./config');

const pool = new Pool({ connectionString: config.databaseUrl, max: 10 });

pool.on('error', (err) => {
  console.error('Database pool error:', err.message);
});

module.exports = pool;