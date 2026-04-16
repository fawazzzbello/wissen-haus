-- Homepage sections management table
CREATE TABLE IF NOT EXISTS homepage_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_name VARCHAR(100) NOT NULL UNIQUE, -- hero, header, body, footer, cta
  section_type VARCHAR(50) NOT NULL DEFAULT 'body',
  title VARCHAR(255),
  subtitle VARCHAR(255),
  description TEXT,
  html_content TEXT,
  image_url VARCHAR(500),
  background_color VARCHAR(7), -- hex color
  text_color VARCHAR(7), -- hex color
  button_text VARCHAR(100),
  button_url VARCHAR(500),
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 1,
  updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT valid_section_type CHECK (section_type IN ('hero', 'header', 'body', 'footer', 'cta', 'stats', 'programs', 'testimonials', 'custom'))
);

-- Create index for faster lookups
CREATE INDEX idx_homepage_sections_name ON homepage_sections(section_name);
CREATE INDEX idx_homepage_sections_active_order ON homepage_sections(is_active, display_order);

-- Insert default homepage sections
INSERT INTO homepage_sections (section_name, section_type, title, subtitle, description, is_active, display_order)
VALUES
  ('hero', 'hero', 'Empowering Future Leaders', 'Educational opportunities for underprivileged youth', 'Wissen-Haus provides comprehensive educational support and mentorship to help young people reach their full potential.', true, 1),
  ('header', 'header', 'Our Mission', 'Education is the key to breaking the cycle of poverty', 'We believe that every child deserves access to quality education regardless of their socioeconomic background.', true, 2),
  ('about', 'body', 'About Wissen-Haus', 'Building Futures Through Education', 'Founded with a vision to democratize education, Wissen-Haus has been transforming lives through personalized learning and mentorship programs. Our impact spans across multiple communities, reaching hundreds of students annually.', true, 3),
  ('impact', 'body', 'Our Impact', 'Making a Difference', 'Since our inception, we have helped thousands of students achieve their educational goals. Through dedicated mentors and comprehensive programs, we are building a brighter future.', true, 4),
  ('cta', 'cta', 'Join Our Mission', 'Help us empower the next generation', 'Your contribution can transform a young person\'s life. Together, we can create lasting change.', true, 5),
  ('footer', 'footer', 'Contact & Connect', 'Get in touch with us', 'Reach out to learn more about our programs or to volunteer with Wissen-Haus.', true, 6)
ON CONFLICT (section_name) DO NOTHING;
