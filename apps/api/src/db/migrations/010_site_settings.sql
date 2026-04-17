-- Site settings and branding management table
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

-- Insert default settings
INSERT INTO site_settings (setting_key, setting_value, setting_type, description)
VALUES
  ('site_name', 'Wissen-Haus', 'string', 'Organization name'),
  ('site_tagline', 'Empowering Future Leaders Through Education', 'string', 'Site tagline'),
  ('logo_url', '/images/logo.png', 'string', 'Logo image URL'),
  ('favicon_url', '/images/favicon.ico', 'string', 'Favicon URL'),
  ('primary_color', '#3052d5', 'string', 'Primary brand color'),
  ('secondary_color', '#d81b60', 'string', 'Secondary brand color'),
  ('hero_image_url', 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1920&h=1080&fit=crop', 'string', 'Hero section background image'),
  ('contact_email', 'hello@wissen-haus.org', 'string', 'Primary contact email'),
  ('phone_number', '+1 (555) 123-4567', 'string', 'Phone number'),
  ('social_twitter', 'https://twitter.com/wissen_haus', 'string', 'Twitter URL'),
  ('social_facebook', 'https://facebook.com/wissen-haus', 'string', 'Facebook URL'),
  ('social_linkedin', 'https://linkedin.com/company/wissen-haus', 'string', 'LinkedIn URL'),
  ('social_instagram', 'https://instagram.com/wissen_haus', 'string', 'Instagram URL'),
  ('google_analytics_id', '', 'string', 'Google Analytics ID'),
  ('meta_description', 'Empowering underprivileged youth through education, skills development, and mentorship programs', 'string', 'Default meta description'),
  ('meta_keywords', 'education, mentorship, charity, nonprofit, youth development', 'string', 'Default meta keywords')
ON CONFLICT (setting_key) DO NOTHING;
