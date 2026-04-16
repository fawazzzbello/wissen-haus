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
      `INSERT INTO users (email, password_hash, first_name, last_name, role, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       ON CONFLICT (email) DO NOTHING`,
      ['admin@wissen-haus.org', adminPassword, 'Admin', 'User', 'super_admin', 'active']
    );

    await client.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, role, status, created_at)
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
      { amount: 500.00, type: 'one_time', status: 'completed', donor_email: 'john@example.com' },
      { amount: 1000.00, type: 'recurring', status: 'completed', donor_email: 'sarah@example.com' },
      { amount: 250.00, type: 'one_time', status: 'completed', donor_email: 'mike@example.com' },
      { amount: 750.00, type: 'recurring', status: 'completed', donor_email: 'emily@example.com' },
      { amount: 1500.00, type: 'one_time', status: 'completed', donor_email: 'james@example.com' },
    ];

    for (const donation of donations) {
      // Get donor_id from email
      const donorResult = await client.query('SELECT id FROM donors WHERE email = $1', [donation.donor_email]);

      if (donorResult.rows.length > 0) {
        const donor_id = donorResult.rows[0].id;
        await client.query(
          `INSERT INTO donations (donor_id, amount, donation_type, status, currency, created_at)
           VALUES ($1, $2, $3, $4, $5, NOW())
           ON CONFLICT DO NOTHING`,
          [donor_id, donation.amount, donation.type, donation.status, 'USD']
        );
      }
    }

    logger.info('✓ Donations seeded');

    // 4. Seed Content Pages
    logger.info('📝 Seeding content pages...');
    const contentPages = [
      {
        slug: 'home',
        title: 'Home',
        content: `<h2>Welcome to Wissen-Haus</h2>
<p>Empowering young people through education, skills development, and mentorship.</p>
<p><a href="/donate">Donate now</a> to support our mission.</p>`,
      },
      {
        slug: 'about-us',
        title: 'About Us',
        content: `<h2>About Wissen-Haus</h2>
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
        slug: 'blog',
        title: 'Blog',
        content: `<h2>Latest Updates</h2>
<p>Stay tuned for inspiring stories, educational tips, and updates about our programs.</p>
<p>Check back soon for new articles!</p>`,
      },
      {
        slug: 'donate',
        title: 'Donate',
        content: `<h2>Make a Difference</h2>
<p>Your donation directly impacts the lives of young people in our community. Whether you donate once or become a monthly supporter, every contribution helps us provide quality education and mentorship.</p>
<p><a href="/donate">Donate now</a></p>`,
      },
      {
        slug: 'contact',
        title: 'Contact',
        content: `<h2>Get in Touch</h2>
<p>Have questions or want to learn more about our programs? We'd love to hear from you!</p>
<p><a href="/contact">Send us a message</a></p>`,
      },
      {
        slug: 'legal',
        title: 'Legal',
        content: `<h2>Legal Information</h2>
<p>Wissen-Haus Empowerment Foundation is registered as a non-profit organization.</p>
<p>For legal inquiries, please contact our office.</p>`,
      },
      {
        slug: 'privacy-policy',
        title: 'Privacy Policy',
        content: `<h2>Privacy Policy</h2>
<p>Your privacy is important to us. This policy explains how we collect, use, and protect your information.</p>
<h3>Information We Collect</h3>
<p>We collect information you provide directly, such as when you donate, subscribe to our newsletter, or contact us.</p>
<h3>How We Use Your Information</h3>
<p>We use your information to process donations, send updates, and improve our services.</p>
<h3>Data Protection</h3>
<p>We take security seriously and implement appropriate safeguards to protect your data.</p>`,
      },
      {
        slug: 'terms-of-service',
        title: 'Terms of Service',
        content: `<h2>Terms of Service</h2>
<p>Welcome to Wissen-Haus. These terms govern your use of our website and services.</p>
<h3>Acceptance of Terms</h3>
<p>By using our website, you agree to these terms and conditions.</p>
<h3>Intellectual Property</h3>
<p>All content on this site is owned by or licensed to Wissen-Haus.</p>
<h3>Limitation of Liability</h3>
<p>We strive to provide accurate information, but make no warranties regarding the content.</p>`,
      },
      {
        slug: 'faq',
        title: 'FAQ',
        content: `<h2>Frequently Asked Questions</h2>
<h3>How can I donate?</h3>
<p>You can donate through our website using our secure payment system.</p>
<h3>What programs do you offer?</h3>
<p>We offer academic tutoring, skills development, and mentorship programs.</p>
<h3>How are donations used?</h3>
<p>Donations go directly to supporting our educational programs and helping young people in our community.</p>
<h3>Can I volunteer?</h3>
<p>Yes! We welcome volunteers. Please contact us to learn about opportunities.</p>`,
      },
      {
        slug: 'quick-links',
        title: 'Quick Links',
        content: `<h2>Quick Links</h2>
<ul>
<li><a href="/">Home</a></li>
<li><a href="/about-us">About Us</a></li>
<li><a href="/blog">Blog</a></li>
<li><a href="/donate">Donate</a></li>
<li><a href="/contact">Contact</a></li>
<li><a href="/faq">FAQ</a></li>
<li><a href="/privacy-policy">Privacy Policy</a></li>
<li><a href="/terms-of-service">Terms of Service</a></li>
</ul>`,
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

    // 5. Seed Homepage Sections with Modern Content
    logger.info('📝 Ensuring homepage sections...');
    const sections = [
      {
        name: 'hero',
        type: 'hero',
        order: 1,
        title: 'Empowering Future Leaders',
        subtitle: 'Building pathways to success for underprivileged youth',
        description: 'Through education, mentorship, and opportunities, we transform lives and create lasting change in our communities.',
        buttonText: '💝 Donate Now',
        buttonUrl: '/donate',
      },
      {
        name: 'mission',
        type: 'header',
        order: 2,
        title: 'Our Mission',
        description: 'To empower young people through access to quality education, skills development, mentorship, and opportunities that foster personal growth, leadership, and sustainable success.',
      },
      {
        name: 'stats',
        type: 'stats',
        order: 3,
        title: 'Our Impact',
        htmlContent: `
          <div data-stat><span data-number>5,000+</span><span data-label>Students Reached</span></div>
          <div data-stat><span data-number>500+</span><span data-label>Active Mentors</span></div>
          <div data-stat><span data-number>95%</span><span data-label>Success Rate</span></div>
          <div data-stat><span data-number>20+</span><span data-label>Communities</span></div>
        `,
      },
      {
        name: 'programs',
        type: 'programs',
        order: 4,
        title: 'Our Programs',
        subtitle: 'Comprehensive educational initiatives designed to transform lives',
        htmlContent: `
          <div data-card>
            <span data-icon>📚</span>
            <span data-title>Academic Excellence</span>
            <span data-description>Personalized tutoring and mentorship programs to help students excel in their studies</span>
          </div>
          <div data-card>
            <span data-icon>💼</span>
            <span data-title>Skills Development</span>
            <span data-description>Job readiness training and vocational skills to prepare students for the workforce</span>
          </div>
          <div data-card>
            <span data-icon>🎯</span>
            <span data-title>Leadership Academy</span>
            <span data-description>Leadership training and personal development programs for emerging leaders</span>
          </div>
        `,
      },
      {
        name: 'testimonials',
        type: 'testimonials',
        order: 5,
        title: 'Success Stories',
        htmlContent: `
          <div data-testimonial>
            <span data-quote>Wissen-Haus changed my life. Their mentorship and support helped me get into university and pursue my dreams.</span>
            <span data-author>Sarah Johnson</span>
            <span data-role>University Student, Class of 2024</span>
          </div>
          <div data-testimonial>
            <span data-quote>The programs offered here are world-class. I gained skills I never thought I could develop and found mentors who truly care.</span>
            <span data-author>Michael Chen</span>
            <span data-role>Program Graduate, Tech Industry</span>
          </div>
          <div data-testimonial>
            <span data-quote>This organization isn't just about education; it's about building confident, capable young leaders ready to change the world.</span>
            <span data-author>Amara Okafor</span>
            <span data-role>Community Leader, Alumni</span>
          </div>
        `,
      },
      {
        name: 'cta',
        type: 'cta',
        order: 6,
        title: 'Join Our Mission',
        subtitle: 'Make a difference in the life of a young person',
        description: 'Your support can transform the life of a young person. Together, we\'re creating opportunities and building futures.',
        buttonText: '💝 Donate Now',
        buttonUrl: '/donate',
        backgroundColor: '#d81b60',
      },
      {
        name: 'footer',
        type: 'footer',
        order: 7,
        title: 'Get in Touch',
        subtitle: 'Connect with Wissen-Haus',
        description: 'Have questions or want to learn more about our programs? We\'d love to hear from you!',
        buttonText: 'Contact Us',
        buttonUrl: '/contact',
      },
    ];

    // Check if homepage_sections table exists first
    try {
      const tableCheck = await client.query(
        `SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'homepage_sections')`
      );

      if (tableCheck.rows[0].exists) {
        for (const section of sections) {
          await client.query(
            `INSERT INTO homepage_sections (section_name, section_type, title, subtitle, description, html_content, button_text, button_url, background_color, display_order, is_active)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, true)
             ON CONFLICT (section_name) DO UPDATE SET
               title = COALESCE($3, title),
               subtitle = COALESCE($4, subtitle),
               description = COALESCE($5, description),
               html_content = COALESCE($6, html_content),
               button_text = COALESCE($7, button_text),
               button_url = COALESCE($8, button_url),
               background_color = COALESCE($9, background_color)`,
            [
              section.name,
              section.type,
              section.title || null,
              section.subtitle || null,
              section.description || null,
              section.htmlContent || null,
              section.buttonText || null,
              section.buttonUrl || null,
              section.backgroundColor || null,
              section.order,
            ]
          );
        }
        logger.info('✓ Homepage sections ensured with modern content');
      } else {
        logger.warn('⚠ Homepage sections table does not exist yet - will be created by migration');
      }
    } catch (error: any) {
      logger.warn('⚠ Error checking/creating homepage sections:', error.message?.substring(0, 100));
    }

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
