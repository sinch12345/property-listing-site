const config = require('./config');
const pool = require('./db');

const SEED_EMAIL = 'seed@nestora.example';

const HOMES = [
  { title: 'The Sunroom Villa', location: 'Lakeside', type: 'Villa', price: 785000, beds: 4, baths: 3, area: 2400, vibes: ['Sunlit mornings', 'Great for hosting'], added: '2026-09-28' },
  { title: 'Corner Loft on Baker Lane', location: 'Old Town', type: 'Apartment', price: 320000, beds: 2, baths: 1, area: 980, vibes: ['Work-from-home ready', 'Quiet street'], added: '2026-09-25' },
  { title: 'Hilltop Garden House', location: 'Hillcrest', type: 'Townhouse', price: 540000, beds: 3, baths: 2, area: 1750, vibes: ['Pet friendly', 'Quiet street'], added: '2026-09-22' },
  { title: 'Harbour Light Studio', location: 'Harbour', type: 'Studio', price: 185000, beds: 1, baths: 1, area: 520, vibes: ['Sunlit mornings', 'Work-from-home ready'], added: '2026-09-20' },
  { title: 'Lantern Court Townhouse', location: 'Old Town', type: 'Townhouse', price: 465000, beds: 3, baths: 2, area: 1500, vibes: ['Great for hosting', 'Pet friendly'], added: '2026-09-15' },
  { title: 'Willow Water Apartment', location: 'Lakeside', type: 'Apartment', price: 255000, beds: 2, baths: 2, area: 880, vibes: ['Quiet street', 'Sunlit mornings'], added: '2026-09-10' },
  { title: 'The Ridge Estate', location: 'Hillcrest', type: 'Villa', price: 1250000, beds: 5, baths: 4, area: 3800, vibes: ['Great for hosting', 'Pet friendly'], added: '2026-09-05' },
  { title: "Mariner's Rest", location: 'Harbour', type: 'Apartment', price: 395000, beds: 2, baths: 2, area: 1100, vibes: ['Sunlit mornings', 'Great for hosting'], added: '2026-08-30' }
];

async function seed() {
  if (config.env === 'production') {
    console.error('Refusing to seed in production.');
    process.exit(1);
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query("DELETE FROM enquiries WHERE property_id IN (SELECT id FROM properties WHERE title = 'Test Villa')");
    await client.query("DELETE FROM properties WHERE title = 'Test Villa'");

    let added = 0;
    for (const h of HOMES) {
      const exists = await client.query(
        'SELECT 1 FROM properties WHERE title = $1 AND owner_email = $2',
        [h.title, SEED_EMAIL]
      );
      if (exists.rowCount) continue;

      const row = await client.query(
        `INSERT INTO properties
           (title, neighborhood_id, type, price, beds, baths, area, status, owner_name, owner_email, created_at)
         VALUES ($1, (SELECT id FROM neighborhoods WHERE name = $2), $3, $4, $5, $6, $7,
                 'approved', 'Nestora Sample', $8, $9)
         RETURNING id`,
        [h.title, h.location, h.type, h.price, h.beds, h.baths, h.area, SEED_EMAIL, h.added]
      );
      for (const vibe of h.vibes) {
        await client.query('INSERT INTO property_vibes (property_id, vibe) VALUES ($1, $2)', [row.rows[0].id, vibe]);
      }
      added++;
    }
    await client.query('COMMIT');
    console.log('Seeded ' + added + ' homes.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Seed failed: ' + err.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

seed();