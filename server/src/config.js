require('dotenv').config();

const REQUIRED = ['DATABASE_URL', 'CORS_ORIGIN'];
const missing = REQUIRED.filter((name) => !process.env[name]);

if (missing.length) {
  console.error('Missing required environment variables: ' + missing.join(', '));
  console.error('Copy .env.example to .env and fill in the values.');
  process.exit(1);
}

module.exports = {
  env: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 3000,
  databaseUrl: process.env.DATABASE_URL,
  corsOrigin: process.env.CORS_ORIGIN
};