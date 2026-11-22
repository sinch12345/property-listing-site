const bcrypt = require('bcryptjs');
const pool = require('./db');

async function run() {
  const email = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD || '';

  if (!email.includes('@') || password.length < 10) {
    console.error('Set ADMIN_EMAIL and ADMIN_PASSWORD (at least 10 characters).');
    process.exitCode = 1;
    return;
  }
  const hash = await bcrypt.hash(password, 12);
  await pool.query(
    `INSERT INTO admins (email, password_hash) VALUES ($1, $2)
     ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash`,
    [email, hash]
  );
  console.log('Admin saved: ' + email);
}

run()
  .catch((err) => { console.error('Failed: ' + err.message); process.exitCode = 1; })
  .finally(() => pool.end());