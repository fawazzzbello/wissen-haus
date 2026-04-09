import { pool } from '@/config/database';
import { logger } from '@/utils/logger';
import bcrypt from 'bcrypt';

async function seedDatabase() {
  const client = await pool.connect();
  try {
    logger.info('Seeding database...');

    // Create test admin user
    const hashedPassword = await bcrypt.hash('admin@123456', 10);

    await client.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, role, status)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (email) DO NOTHING`,
      [
        'admin@wissen-haus.org',
        hashedPassword,
        'Admin',
        'User',
        'super_admin',
        'active',
      ]
    );

    logger.info('✓ Created admin user: admin@wissen-haus.org (password: admin@123456)');

    // Create sample donors
    for (let i = 1; i <= 5; i++) {
      await client.query(
        `INSERT INTO donors (email, first_name, last_name, phone, country, total_donated, donation_count)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT DO NOTHING`,
        [
          `donor${i}@example.com`,
          `Donor`,
          `${i}`,
          `+1234567890${i}`,
          'United States',
          Math.random() * 10000,
          Math.floor(Math.random() * 10),
        ]
      );
    }

    logger.info('✓ Created 5 sample donors');

    // Create homepage content
    await client.query(
      `INSERT INTO content_pages (slug, title, content_html, meta_description, is_published)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (slug) DO NOTHING`,
      [
        'home',
        'Welcome to Wissen-Haus',
        '<h1>Empower Young People</h1><p>Transform lives through knowledge and mentorship</p>',
        'Wissen-Haus Empowerment Foundation',
        true,
      ]
    );

    logger.info('✓ Created home page content');

    logger.info('✓ Database seeding completed successfully');
  } catch (error) {
    logger.error('Seed failed:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

seedDatabase();
