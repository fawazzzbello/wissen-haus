import { pool } from '@/config/database';
import { logger } from '@/utils/logger';
import bcrypt from 'bcrypt';

async function createHomepageSectionsTable(client: any) {
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS homepage_sections (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        section_name VARCHAR(100) NOT NULL UNIQUE,
        section_type VARCHAR(50) NOT NULL DEFAULT 'custom',
        title VARCHAR(255),
        subtitle VARCHAR(255),
        description TEXT,
        html_content TEXT,
        image_url VARCHAR(500),
        background_color VARCHAR(7),
        text_color VARCHAR(7),
        button_text VARCHAR(100),
        button_url VARCHAR(500),
        is_active BOOLEAN DEFAULT true,
        display_order INTEGER DEFAULT 1,
        updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        CONSTRAINT valid_section_type CHECK (section_type IN (
          'hero-premium', 'stats-advanced', 'programs-grid', 'features-list',
          'team', 'testimonials-advanced', 'newsletter', 'faq-accordion',
          'partners', 'events', 'donation-tiers', 'timeline',
          'two-column-advanced', 'cta-banner', 'custom'
        ))
      );
      CREATE INDEX IF NOT EXISTS idx_homepage_sections_name ON homepage_sections(section_name);
      CREATE INDEX IF NOT EXISTS idx_homepage_sections_active_order ON homepage_sections(is_active, display_order);
    `);
    logger.info('✓ Homepage sections table created');
  } catch (error: any) {
    logger.warn('⚠ Homepage sections table:', error.message?.substring(0, 100));
  }
}

async function createSiteSettingsTable(client: any) {
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS site_settings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        setting_key VARCHAR(100) NOT NULL UNIQUE,
        setting_value TEXT,
        setting_type VARCHAR(50) DEFAULT 'string',
        description TEXT,
        updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_site_settings_key ON site_settings(setting_key);
    `);
    logger.info('✓ Site settings table created');
  } catch (error: any) {
    logger.warn('⚠ Site settings table:', error.message?.substring(0, 100));
  }
}

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
<p>Have questions or want to learn more about our programs? We would love to hear from you!</p>
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

    // 5. Create and Seed Homepage Sections
    logger.info('📝 Setting up homepage sections...');
    await createHomepageSectionsTable(client);

    const sections = [
      {
        name: 'hero',
        type: 'hero-premium',
        title: 'Empowering Future Leaders',
        subtitle: 'Building pathways to success for underprivileged youth',
        description: 'Through education, mentorship, and opportunities, we transform lives and create lasting change in our communities.',
        buttonText: '💝 Donate Now',
        buttonUrl: '/donate',
        order: 1,
      },
      {
        name: 'stats',
        type: 'stats-advanced',
        title: 'Our Impact',
        subtitle: 'Making a measurable difference every day',
        htmlContent: '<div data-stat><span data-number>5,000+</span><span data-label>Students Reached</span></div><div data-stat><span data-number>500+</span><span data-label>Active Mentors</span></div><div data-stat><span data-number>95%</span><span data-label>Success Rate</span></div><div data-stat><span data-number>20+</span><span data-label>Communities Served</span></div>',
        order: 2,
      },
      {
        name: 'programs',
        type: 'programs-grid',
        title: 'Our Programs',
        subtitle: 'Comprehensive educational initiatives',
        htmlContent: '<div data-card><span data-icon>📚</span><span data-title>Academic Excellence</span><span data-description>Personalized tutoring and mentorship</span></div><div data-card><span data-icon>💼</span><span data-title>Skills Development</span><span data-description>Job readiness and vocational training</span></div><div data-card><span data-icon>🎯</span><span data-title>Leadership Academy</span><span data-description>Leadership training and development</span></div><div data-card><span data-icon>🌟</span><span data-title>Scholarship Fund</span><span data-description>Financial assistance and scholarships</span></div><div data-card><span data-icon>🤝</span><span data-title>Community Mentorship</span><span data-description>One-on-one mentoring relationships</span></div><div data-card><span data-icon>🎓</span><span data-title>Alumni Network</span><span data-description>Program graduate community</span></div>',
        order: 3,
      },
      {
        name: 'testimonials',
        type: 'testimonials-advanced',
        title: 'Success Stories from Our Community',
        subtitle: 'Real impact from real people',
        htmlContent: '<div data-testimonial><span data-quote>Wissen-Haus changed my life. The mentorship helped me get into university and pursue my engineering dreams. I now work at a top tech company!</span><span data-author>Sarah Johnson</span><span data-role>Software Engineer</span></div><div data-testimonial><span data-quote>The programs are world-class. I gained skills I never thought I could develop and found mentors who genuinely cared about my success.</span><span data-author>Michael Chen</span><span data-role>Business Analyst</span></div><div data-testimonial><span data-quote>This organization builds confident leaders ready to change the world. The support system is incredible and life-changing.</span><span data-author>Amara Okafor</span><span data-role>Community Leader & Alumni</span></div>',
        order: 4,
      },
      {
        name: 'features',
        type: 'features-list',
        title: 'Why Choose Wissen-Haus',
        subtitle: 'What sets us apart',
        description: 'Committed to providing world-class educational support.',
        imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=400&fit=crop',
        order: 5,
      },
      {
        name: 'newsletter',
        type: 'newsletter',
        title: 'Stay Connected',
        subtitle: 'Get the latest updates from our community',
        description: 'Subscribe to receive impact stories and program updates.',
        order: 6,
      },
      {
        name: 'faq',
        type: 'faq-accordion',
        title: 'Frequently Asked Questions',
        htmlContent: '<div data-faq><span data-question>How can I enroll?</span><span data-answer>Contact us to learn about current enrollment opportunities.</span></div><div data-faq><span data-question>What programs do you offer?</span><span data-answer>We offer Academic Excellence, Skills Development, Leadership Academy, Scholarships, and Mentorship.</span></div><div data-faq><span data-question>How are donations used?</span><span data-answer>90% of funds go directly to program delivery and student support.</span></div>',
        order: 7,
      },
      {
        name: 'cta',
        type: 'cta-banner',
        title: 'Make a Difference Today',
        subtitle: 'Join us in transforming lives',
        description: 'Your support enables us to provide education and opportunities to young people.',
        buttonText: '💝 Donate Now',
        buttonUrl: '/donate',
        backgroundColor: '#3052d5',
        order: 8,
      },
    ];

    for (const section of sections) {
      await client.query(
        `INSERT INTO homepage_sections (section_name, section_type, title, subtitle, description, html_content, button_text, button_url, background_color, display_order, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, true)
         ON CONFLICT (section_name) DO UPDATE SET
           section_type = EXCLUDED.section_type,
           title = EXCLUDED.title,
           subtitle = EXCLUDED.subtitle,
           description = EXCLUDED.description,
           html_content = EXCLUDED.html_content,
           button_text = EXCLUDED.button_text,
           button_url = EXCLUDED.button_url,
           background_color = EXCLUDED.background_color,
           display_order = EXCLUDED.display_order,
           updated_at = NOW()`,
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

    logger.info('✓ Homepage sections seeded');

    // 6. Create and Seed Site Settings
    logger.info('📝 Setting up site settings...');
    await createSiteSettingsTable(client);

    const settings = [
      // Branding
      { key: 'site_name', value: 'Wissen-Haus Empowerment Foundation' },
      { key: 'site_tagline', value: 'Empowering Future Leaders Through Education' },
      { key: 'logo_url', value: '/images/logo.png' },
      { key: 'favicon_url', value: '/images/favicon.ico' },

      // Hero Section
      { key: 'hero_title', value: 'Empowering Young People Through Education' },
      { key: 'hero_subtitle', value: 'Building the Future Leaders of Tomorrow' },
      { key: 'hero_description', value: 'We provide comprehensive education, mentorship, and skills development to underprivileged youth, creating pathways to success and transforming communities.' },
      { key: 'hero_button_text', value: '💚 Start Your Journey' },

      // Mission & Vision
      { key: 'mission_title', value: 'Our Mission' },
      { key: 'mission_description', value: 'To democratize quality education and create sustainable opportunities for underprivileged youth through innovative programs, dedicated mentorship, and community partnerships.' },
      { key: 'vision_title', value: 'Our Vision' },
      { key: 'vision_description', value: 'A world where every young person, regardless of background, has access to world-class education and the support to achieve their full potential.' },

      // Impact Statistics
      { key: 'stat1_value', value: '5,000+' },
      { key: 'stat1_label', value: 'Students Reached' },
      { key: 'stat2_value', value: '500+' },
      { key: 'stat2_label', value: 'Active Mentors' },
      { key: 'stat3_value', value: '95%' },
      { key: 'stat3_label', value: 'Success Rate' },
      { key: 'stat4_value', value: '20+' },
      { key: 'stat4_label', value: 'Communities' },

      // Programs
      { key: 'program1_title', value: 'Academic Excellence' },
      { key: 'program1_desc', value: 'Personalized tutoring and mentorship in core subjects' },
      { key: 'program2_title', value: 'Skills Development' },
      { key: 'program2_desc', value: 'Job-ready skills and vocational training' },
      { key: 'program3_title', value: 'Leadership Academy' },
      { key: 'program3_desc', value: 'Leadership training and personal development' },
      { key: 'program4_title', value: 'Scholarships & Financial Aid' },
      { key: 'program4_desc', value: 'Financial assistance for higher education' },
      { key: 'program5_title', value: 'Professional Mentorship' },
      { key: 'program5_desc', value: 'One-on-one relationships with industry professionals' },
      { key: 'program6_title', value: 'Alumni Network & Career Support' },
      { key: 'program6_desc', value: 'Lifelong support and career advancement opportunities' },

      // Testimonials
      { key: 'testimonial1_quote', value: 'Wissen-Haus transformed my life. The mentorship helped me get into my dream university and pursue my passion for engineering.' },
      { key: 'testimonial1_author', value: 'Sarah Johnson' },
      { key: 'testimonial1_role', value: 'Software Engineer' },
      { key: 'testimonial2_quote', value: 'The programs here are world-class. I gained skills I never thought I could develop and mentors who genuinely cared.' },
      { key: 'testimonial2_author', value: 'Michael Chen' },
      { key: 'testimonial2_role', value: 'Business Analyst' },
      { key: 'testimonial3_quote', value: 'This organization builds confident leaders ready to change the world. The support system is incredible!' },
      { key: 'testimonial3_author', value: 'Amara Okafor' },
      { key: 'testimonial3_role', value: 'Community Leader' },

      // Call to Action
      { key: 'cta_title', value: 'Make a Real Impact Today' },
      { key: 'cta_description', value: 'Your support directly impacts young lives. Join us in creating pathways to success and transforming communities.' },
      { key: 'cta_button_text', value: '💚 Donate Now' },

      // Contact Information
      { key: 'contact_email', value: 'hello@wissen-haus.org' },
      { key: 'phone_number', value: '+1 (555) 123-4567' },
      { key: 'social_twitter', value: 'https://twitter.com/wissen_haus' },
      { key: 'social_facebook', value: 'https://facebook.com/wissen-haus' },
      { key: 'social_linkedin', value: 'https://linkedin.com/company/wissen-haus' },
      { key: 'social_instagram', value: 'https://instagram.com/wissen_haus' },

      // SEO & Analytics
      { key: 'meta_description', value: 'Wissen-Haus Empowerment Foundation - Empowering underprivileged youth through education, mentorship, and skills development' },
      { key: 'meta_keywords', value: 'education, mentorship, charity, nonprofit, youth development, scholarships' },
      { key: 'google_analytics_id', value: '' },
    ];

    for (const setting of settings) {
      await client.query(
        `INSERT INTO site_settings (setting_key, setting_value)
         VALUES ($1, $2)
         ON CONFLICT (setting_key) DO UPDATE SET
           setting_value = EXCLUDED.setting_value`,
        [setting.key, setting.value]
      );
    }

    logger.info('✓ Site settings seeded');

    logger.info('✅ Database seeding completed successfully!');
  } catch (error: any) {
    logger.error('❌ Database seeding error:', error);
    throw error;
  } finally {
    client.release();
  }
}

export async function ensureDatabasePopulated() {
  try {
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
