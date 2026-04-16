-- Homepage sections management table with modern section types
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
    'hero-premium',
    'stats-advanced',
    'programs-grid',
    'features-list',
    'team',
    'testimonials-advanced',
    'newsletter',
    'faq-accordion',
    'partners',
    'events',
    'donation-tiers',
    'timeline',
    'two-column-advanced',
    'cta-banner',
    'custom'
  ))
);

CREATE INDEX IF NOT EXISTS idx_homepage_sections_name ON homepage_sections(section_name);
CREATE INDEX IF NOT EXISTS idx_homepage_sections_active_order ON homepage_sections(is_active, display_order);

-- Insert default homepage sections if they don't exist
INSERT INTO homepage_sections (section_name, section_type, title, subtitle, description, is_active, display_order)
VALUES
  ('hero', 'hero-premium', 'Empowering Future Leaders', 'Building pathways to success for underprivileged youth', 'Through education, mentorship, and opportunities, we transform lives and create lasting change in our communities.', true, 1)
ON CONFLICT (section_name) DO NOTHING;
