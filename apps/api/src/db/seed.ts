import { pool } from '@/config/database';
import { logger } from '@/utils/logger';
import bcrypt from 'bcrypt';

export async function seedDatabase() {
  const client = await pool.connect();
  try {
    logger.info('🌱 Starting database seeding...');

    // 1. Seed Users
    logger.info('📝 Seeding users...');
    const adminPassword = await bcrypt.hash('admin@123456', 10);
    const demoPassword = await bcrypt.hash('demo@123456', 10);

    await client.query(
      `INSERT INTO users (email, password, first_name, last_name, role, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       ON CONFLICT (email) DO NOTHING`,
      ['admin@wissen-haus.org', adminPassword, 'Admin', 'User', 'super_admin', 'active']
    );

    await client.query(
      `INSERT INTO users (email, password, first_name, last_name, role, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       ON CONFLICT (email) DO NOTHING`,
      ['demo@wissen-haus.org', demoPassword, 'Demo', 'User', 'admin', 'active']
    );

    logger.info('✓ Users seeded');

    // 2. Seed Donors
    logger.info('📝 Seeding donors...');
    const donors = [
      { name: 'John Smith', email: 'john@example.com', phone: '+1234567890' },
      { name: 'Sarah Johnson', email: 'sarah@example.com', phone: '+1987654321' },
      { name: 'Mike Davis', email: 'mike@example.com', phone: '+1111111111' },
      { name: 'Emily Wilson', email: 'emily@example.com', phone: '+1555555555' },
      { name: 'James Brown', email: 'james@example.com', phone: '+1222222222' },
    ];

    for (const donor of donors) {
      await client.query(
        `INSERT INTO donors (name, email, phone, created_at)
         VALUES ($1, $2, $3, NOW())
         ON CONFLICT (email) DO NOTHING`,
        [donor.name, donor.email, donor.phone]
      );
    }

    logger.info('✓ Donors seeded');

    // 3. Seed Donations
    logger.info('📝 Seeding donations...');
    const donations = [
      { amount: 50000, type: 'one_time', status: 'completed', donor_email: 'john@example.com' },
      { amount: 100000, type: 'recurring', status: 'completed', donor_email: 'sarah@example.com' },
      { amount: 25000, type: 'one_time', status: 'completed', donor_email: 'mike@example.com' },
      { amount: 75000, type: 'recurring', status: 'completed', donor_email: 'emily@example.com' },
      { amount: 150000, type: 'one_time', status: 'completed', donor_email: 'james@example.com' },
    ];

    for (const donation of donations) {
      await client.query(
        `INSERT INTO donations (amount_cents, donation_type, status, donor_email, created_at)
         VALUES ($1, $2, $3, $4, NOW())
         ON CONFLICT DO NOTHING`,
        [donation.amount, donation.type, donation.status, donation.donor_email]
      );
    }

    logger.info('✓ Donations seeded');

    // 4. Seed Content Pages
    logger.info('📝 Seeding content pages...');
    const contentPages = [
      {
        slug: 'about',
        title: 'About Wissen-Haus',
        content: `<h2>Our Story</h2>
<p>Wissen-Haus was founded with a vision to democratize education and provide opportunities for underprivileged youth. Our mission is to empower the next generation of leaders through quality education and mentorship.</p>
<h2>Our Values</h2>
<ul>
<li><strong>Education:</strong> We believe education is the foundation for success</li>
<li><strong>Integrity:</strong> We operate with transparency and honesty</li>
<li><strong>Community:</strong> We build strong communities through collaboration</li>
<li><strong>Excellence:</strong> We strive for the highest quality in everything we do</li>
</ul>`,
      },
      {
        slug: 'programs',
        title: 'Our Programs',
        content: `<h2>Educational Programs</h2>
<h3>Academic Excellence Program</h3>
<p>Comprehensive tutoring and mentorship for students of all levels.</p>
<h3>Skills Development</h3>
<p>Training in technical and soft skills for career advancement.</p>
<h3>Leadership Initiative</h3>
<p>Developing tomorrow's leaders through intensive workshops and mentoring.</p>`,
      },
      {
        slug: 'impact',
        title: 'Our Impact',
        content: `<h2>Making a Difference</h2>
<p>Since our inception, we have:</p>
<ul>
<li>Helped 5,000+ students achieve their educational goals</li>
<li>Provided 10,000+ hours of tutoring</li>
<li>Trained 1,000+ students in technical skills</li>
<li>Supported 500+ students into higher education</li>
</ul>
<p>Your contribution makes these achievements possible.</p>`,
      },
    ];

    for (const page of contentPages) {
      await client.query(
        `INSERT INTO content_pages (slug, title, content_html, is_published, created_at, updated_at)
         VALUES ($1, $2, $3, true, NOW(), NOW())
         ON CONFLICT (slug) DO NOTHING`,
        [page.slug, page.title, page.content]
      );
    }

    logger.info('✓ Content pages seeded');

    // 5. Seed Homepage Sections (already done by migration, but ensure they exist)
    logger.info('📝 Ensuring homepage sections...');
    const sections = [
      { name: 'hero', type: 'hero', order: 1 },
      { name: 'header', type: 'header', order: 2 },
      { name: 'about', type: 'body', order: 3 },
      { name: 'impact', type: 'body', order: 4 },
      { name: 'cta', type: 'cta', order: 5 },
      { name: 'footer', type: 'footer', order: 6 },
    ];

    for (const section of sections) {
      await client.query(
        `INSERT INTO homepage_sections (section_name, section_type, display_order, is_active)
         VALUES ($1, $2, $3, true)
         ON CONFLICT (section_name) DO NOTHING`,
        [section.name, section.type, section.order]
      );
    }

    logger.info('✓ Homepage sections ensured');

    // 6. Seed Blog Posts
    logger.info('📝 Seeding blog posts...');
    const blogPosts = [
      {
        title: 'Education Transforms Lives',
        slug: 'education-transforms-lives',
        content: 'Read how quality education has transformed the lives of our students...',
      },
      {
        title: 'Student Success Stories',
        slug: 'student-success-stories',
        content: 'Inspiring stories from our scholarship recipients...',
      },
      {
        title: 'The Power of Mentorship',
        slug: 'power-of-mentorship',
        content: 'Why mentorship is crucial for student development...',
      },
    ];

    for (const post of blogPosts) {
      await client.query(
        `INSERT INTO blog_posts (title, slug, content_html, is_published, created_at, updated_at)
         VALUES ($1, $2, $3, true, NOW(), NOW())
         ON CONFLICT (slug) DO NOTHING`,
        [post.title, post.slug, `<p>${post.content}</p>`]
      );
    }

    logger.info('✓ Blog posts seeded');

    logger.info('✅ Database seeding completed successfully!');
  } catch (error: any) {
    logger.error('❌ Database seeding error:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run seeding on startup if needed
export async function ensureDatabasePopulated() {
  try {
    // Check if we already have data
    const result = await pool.query('SELECT COUNT(*) as count FROM users');
    const userCount = parseInt(result.rows[0].count);

    if (userCount === 0) {
      logger.info('Database is empty, seeding...');
      await seedDatabase();
    } else {
      logger.info(`Database already populated with ${userCount} users`);
    }
  } catch (error: any) {
    logger.error('Error checking database population:', error);
  }
}
