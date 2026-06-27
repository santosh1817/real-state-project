import bcrypt from 'bcryptjs';
import { pool } from './pool.js';

const images = [
  'https://images.unsplash.com/photo-1564013799919-ab600027ffc6',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c'
];

async function seed() {
  const passwordHash = await bcrypt.hash('Password123', 12);
  const user = await pool.query(
    `INSERT INTO users (name, email, password_hash, phone)
     VALUES ('Demo Owner', 'owner@example.com', $1, '+919999999999')
     ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
     RETURNING id`,
    [passwordHash]
  );

  for (let i = 1; i <= 24; i += 1) {
    await pool.query(
      `INSERT INTO properties
       (owner_id, title, description, city, location, property_type, listing_type, price, bedrooms, bathrooms, area_sqft, image_urls, amenities)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
      [
        user.rows[0].id,
        `Modern ${i % 3 === 0 ? 'Villa' : 'Apartment'} in ${i % 2 === 0 ? 'Bengaluru' : 'Pune'}`,
        'A thoughtfully planned home with strong connectivity, natural light, secure access, and practical amenities for modern families.',
        i % 2 === 0 ? 'Bengaluru' : 'Pune',
        i % 2 === 0 ? 'Whitefield' : 'Hinjewadi',
        i % 3 === 0 ? 'villa' : 'apartment',
        i % 4 === 0 ? 'rent' : 'sale',
        3500000 + i * 225000,
        (i % 4) + 1,
        (i % 3) + 1,
        750 + i * 60,
        [images[i % images.length]],
        ['parking', 'security', 'power backup']
      ]
    );
  }

  console.log('Seeded demo data. Login: owner@example.com / Password123');
  await pool.end();
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
