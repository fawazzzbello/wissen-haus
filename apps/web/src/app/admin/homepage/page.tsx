'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { getApiClient } from '@/lib/api-client';

interface FieldConfig {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'number';
  rows?: number;
}

interface FieldGroup {
  id: string;
  title: string;
  description: string;
  fields: FieldConfig[];
}

interface PageConfig {
  id: string;
  title: string;
  icon: string;
  groups: FieldGroup[];
}

const PAGES: PageConfig[] = [
  {
    id: 'home',
    title: 'Home',
    icon: '🏠',
    groups: [
      {
        id: 'hero',
        title: '🦸 Hero Section',
        description: 'Main landing section with title, subtitle, and CTA',
        fields: [
          { key: 'hero_title', label: 'Title', type: 'text' },
          { key: 'hero_subtitle', label: 'Subtitle', type: 'text' },
          { key: 'hero_description', label: 'Description', type: 'textarea', rows: 3 },
          { key: 'hero_button_text', label: 'Button Text', type: 'text' },
        ],
      },
      {
        id: 'mission_vision',
        title: '🎯 Mission & Vision',
        description: 'Organization mission and vision statements',
        fields: [
          { key: 'mission_title', label: 'Mission Title', type: 'text' },
          { key: 'mission_description', label: 'Mission Description', type: 'textarea', rows: 3 },
          { key: 'vision_title', label: 'Vision Title', type: 'text' },
          { key: 'vision_description', label: 'Vision Description', type: 'textarea', rows: 3 },
        ],
      },
      {
        id: 'impact_stats',
        title: '📊 Impact Statistics',
        description: 'Organization impact metrics and statistics',
        fields: [
          { key: 'stat1_value', label: 'Stat 1 Value', type: 'text' },
          { key: 'stat1_label', label: 'Stat 1 Label', type: 'text' },
          { key: 'stat2_value', label: 'Stat 2 Value', type: 'text' },
          { key: 'stat2_label', label: 'Stat 2 Label', type: 'text' },
          { key: 'stat3_value', label: 'Stat 3 Value', type: 'text' },
          { key: 'stat3_label', label: 'Stat 3 Label', type: 'text' },
          { key: 'stat4_value', label: 'Stat 4 Value', type: 'text' },
          { key: 'stat4_label', label: 'Stat 4 Label', type: 'text' },
        ],
      },
      {
        id: 'programs_1_3',
        title: '📚 Programs 1-3',
        description: 'First three program offerings',
        fields: [
          { key: 'program1_title', label: 'Program 1 Title', type: 'text' },
          { key: 'program1_desc', label: 'Program 1 Description', type: 'textarea', rows: 2 },
          { key: 'program2_title', label: 'Program 2 Title', type: 'text' },
          { key: 'program2_desc', label: 'Program 2 Description', type: 'textarea', rows: 2 },
          { key: 'program3_title', label: 'Program 3 Title', type: 'text' },
          { key: 'program3_desc', label: 'Program 3 Description', type: 'textarea', rows: 2 },
        ],
      },
      {
        id: 'programs_4_6',
        title: '💼 Programs 4-6',
        description: 'Last three program offerings',
        fields: [
          { key: 'program4_title', label: 'Program 4 Title', type: 'text' },
          { key: 'program4_desc', label: 'Program 4 Description', type: 'textarea', rows: 2 },
          { key: 'program5_title', label: 'Program 5 Title', type: 'text' },
          { key: 'program5_desc', label: 'Program 5 Description', type: 'textarea', rows: 2 },
          { key: 'program6_title', label: 'Program 6 Title', type: 'text' },
          { key: 'program6_desc', label: 'Program 6 Description', type: 'textarea', rows: 2 },
        ],
      },
      {
        id: 'testimonials',
        title: '⭐ Testimonials',
        description: 'Student and alumni success stories',
        fields: [
          { key: 'testimonial1_quote', label: 'Testimonial 1 Quote', type: 'textarea', rows: 2 },
          { key: 'testimonial1_author', label: 'Testimonial 1 Author', type: 'text' },
          { key: 'testimonial1_role', label: 'Testimonial 1 Role', type: 'text' },
          { key: 'testimonial2_quote', label: 'Testimonial 2 Quote', type: 'textarea', rows: 2 },
          { key: 'testimonial2_author', label: 'Testimonial 2 Author', type: 'text' },
          { key: 'testimonial2_role', label: 'Testimonial 2 Role', type: 'text' },
          { key: 'testimonial3_quote', label: 'Testimonial 3 Quote', type: 'textarea', rows: 2 },
          { key: 'testimonial3_author', label: 'Testimonial 3 Author', type: 'text' },
          { key: 'testimonial3_role', label: 'Testimonial 3 Role', type: 'text' },
        ],
      },
      {
        id: 'cta',
        title: '🎁 Call to Action',
        description: 'Final section encouraging donations and involvement',
        fields: [
          { key: 'cta_title', label: 'CTA Title', type: 'text' },
          { key: 'cta_description', label: 'CTA Description', type: 'textarea', rows: 3 },
          { key: 'cta_button_text', label: 'CTA Button Text', type: 'text' },
        ],
      },
    ],
  },
  {
    id: 'donate',
    title: 'Donate',
    icon: '💚',
    groups: [
      {
        id: 'donate_hero',
        title: '🦸 Hero Section',
        description: 'Donation page header and introduction',
        fields: [
          { key: 'donate_title', label: 'Title', type: 'text' },
          { key: 'donate_subtitle', label: 'Subtitle', type: 'textarea', rows: 2 },
        ],
      },
      {
        id: 'donate_impact',
        title: '💰 Impact Tiers',
        description: 'Donation impact descriptions',
        fields: [
          { key: 'donate_impact1', label: 'Impact 1 Title', type: 'text' },
          { key: 'donate_impact1_desc', label: 'Impact 1 Description', type: 'textarea', rows: 2 },
          { key: 'donate_impact2', label: 'Impact 2 Title', type: 'text' },
          { key: 'donate_impact2_desc', label: 'Impact 2 Description', type: 'textarea', rows: 2 },
          { key: 'donate_impact3', label: 'Impact 3 Title', type: 'text' },
          { key: 'donate_impact3_desc', label: 'Impact 3 Description', type: 'textarea', rows: 2 },
          { key: 'donate_impact4', label: 'Impact 4 Title', type: 'text' },
          { key: 'donate_impact4_desc', label: 'Impact 4 Description', type: 'textarea', rows: 2 },
        ],
      },
      {
        id: 'donate_info',
        title: 'ℹ️ Information',
        description: 'Transparency and FAQ sections',
        fields: [
          { key: 'donate_why', label: 'Why Donate Section', type: 'textarea', rows: 4 },
          { key: 'donate_faq1', label: 'FAQ 1 Answer', type: 'textarea', rows: 3 },
          { key: 'donate_faq2', label: 'FAQ 2 Answer', type: 'textarea', rows: 3 },
          { key: 'donate_faq3', label: 'FAQ 3 Answer', type: 'textarea', rows: 3 },
        ],
      },
    ],
  },
  {
    id: 'about',
    title: 'About',
    icon: '📖',
    groups: [
      {
        id: 'about_hero',
        title: '🦸 Hero Section',
        description: 'About page header',
        fields: [
          { key: 'about_title', label: 'Title', type: 'text' },
          { key: 'about_subtitle', label: 'Subtitle', type: 'textarea', rows: 2 },
        ],
      },
      {
        id: 'about_org',
        title: '🏢 Organization',
        description: 'Organization description and overview',
        fields: [
          { key: 'about_org_description', label: 'Description 1', type: 'textarea', rows: 3 },
          { key: 'about_org_description2', label: 'Description 2', type: 'textarea', rows: 3 },
        ],
      },
      {
        id: 'about_approach',
        title: '🎯 Our Approach',
        description: 'Three key approach areas',
        fields: [
          { key: 'about_approach1', label: 'Approach 1 (Knowledge Transfer)', type: 'textarea', rows: 2 },
          { key: 'about_approach2', label: 'Approach 2 (Skills Development)', type: 'textarea', rows: 2 },
          { key: 'about_approach3', label: 'Approach 3', type: 'textarea', rows: 2 },
        ],
      },
      {
        id: 'about_values',
        title: '💡 Core Values',
        description: 'Organization values',
        fields: [
          { key: 'about_value1', label: 'Value 1', type: 'text' },
          { key: 'about_value2', label: 'Value 2', type: 'text' },
          { key: 'about_value3', label: 'Value 3', type: 'text' },
          { key: 'about_value4', label: 'Value 4', type: 'text' },
        ],
      },
      {
        id: 'about_impact',
        title: '📊 Impact Metrics',
        description: 'Organization impact statistics',
        fields: [
          { key: 'about_impact1_value', label: 'Metric 1 Value', type: 'text' },
          { key: 'about_impact1_label', label: 'Metric 1 Label', type: 'text' },
          { key: 'about_impact2_value', label: 'Metric 2 Value', type: 'text' },
          { key: 'about_impact2_label', label: 'Metric 2 Label', type: 'text' },
          { key: 'about_impact3_value', label: 'Metric 3 Value', type: 'text' },
          { key: 'about_impact3_label', label: 'Metric 3 Label', type: 'text' },
          { key: 'about_impact4_value', label: 'Metric 4 Value', type: 'text' },
          { key: 'about_impact4_label', label: 'Metric 4 Label', type: 'text' },
        ],
      },
      {
        id: 'about_cta',
        title: '🎁 Call to Action',
        description: 'Final CTA on about page',
        fields: [
          { key: 'about_cta_title', label: 'CTA Title', type: 'text' },
          { key: 'about_cta_description', label: 'CTA Description', type: 'textarea', rows: 3 },
        ],
      },
    ],
  },
  {
    id: 'contact',
    title: 'Contact',
    icon: '📧',
    groups: [
      {
        id: 'contact_hero',
        title: '🦸 Hero Section',
        description: 'Contact page header',
        fields: [
          { key: 'contact_title', label: 'Title', type: 'text' },
          { key: 'contact_subtitle', label: 'Subtitle', type: 'textarea', rows: 2 },
        ],
      },
      {
        id: 'contact_info',
        title: '📍 Contact Information',
        description: 'Organization contact details',
        fields: [
          { key: 'contact_email', label: 'Email', type: 'text' },
          { key: 'phone_number', label: 'Phone Number', type: 'text' },
          { key: 'contact_address', label: 'Address', type: 'textarea', rows: 3 },
          { key: 'contact_hours', label: 'Business Hours', type: 'textarea', rows: 3 },
          { key: 'contact_response_info', label: 'Response Information', type: 'textarea', rows: 2 },
        ],
      },
      {
        id: 'contact_social',
        title: '🔗 Social Media',
        description: 'Social media links',
        fields: [
          { key: 'social_facebook', label: 'Facebook URL', type: 'text' },
          { key: 'social_twitter', label: 'Twitter URL', type: 'text' },
          { key: 'social_linkedin', label: 'LinkedIn URL', type: 'text' },
          { key: 'social_instagram', label: 'Instagram URL', type: 'text' },
        ],
      },
    ],
  },
  {
    id: 'faq',
    title: 'FAQ',
    icon: '❓',
    groups: [
      {
        id: 'faq_hero',
        title: '🦸 Hero Section',
        description: 'FAQ page header',
        fields: [
          { key: 'faq_title', label: 'Title', type: 'text' },
          { key: 'faq_subtitle', label: 'Subtitle', type: 'textarea', rows: 2 },
        ],
      },
      {
        id: 'faq_support',
        title: '🤝 Support Section',
        description: 'Support information',
        fields: [
          { key: 'faq_support_title', label: 'Support Title', type: 'text' },
          { key: 'faq_support_description', label: 'Support Description', type: 'textarea', rows: 3 },
          { key: 'contact_email', label: 'Contact Email', type: 'text' },
        ],
      },
    ],
  },
  {
    id: 'blog',
    title: 'Blog',
    icon: '📝',
    groups: [
      {
        id: 'blog_hero',
        title: '🦸 Hero Section',
        description: 'Blog page header',
        fields: [
          { key: 'blog_title', label: 'Title', type: 'text' },
          { key: 'blog_subtitle', label: 'Subtitle', type: 'textarea', rows: 2 },
        ],
      },
      {
        id: 'blog_newsletter',
        title: '📬 Newsletter Section',
        description: 'Newsletter signup section',
        fields: [
          { key: 'blog_newsletter_text', label: 'Newsletter Text', type: 'textarea', rows: 3 },
        ],
      },
    ],
  },
];

export default function FrontpageEditor() {
  const [content, setContent] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [changedFields, setChangedFields] = useState<Set<string>>(new Set());
  const [expandedGroup, setExpandedGroup] = useState<string>('');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [currentPageId, setCurrentPageId] = useState('home');

  useEffect(() => {
    fetchContent();
  }, []);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const fetchContent = async () => {
    try {
      setLoading(true);
      setError(null);
      const api = getApiClient();
      const res = await api.get('/settings');
      setContent(res.data.settings || {});
      setChangedFields(new Set());
      setLastSaved(new Date());
    } catch (err: any) {
      console.error('Error fetching content:', err);
      setError(err.message || 'Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key: string, value: string) => {
    setContent((prev) => ({ ...prev, [key]: value }));
    setChangedFields((prev) => new Set(prev).add(key));
  };

  const handleSave = async () => {
    if (changedFields.size === 0) return;

    try {
      setSaving(true);
      setError(null);
      const api = getApiClient();

      const settingsToUpdate: Record<string, any> = {};
      changedFields.forEach((key) => {
        settingsToUpdate[key] = content[key] || '';
      });

      await api.post('/settings/admin/bulk', { settings: settingsToUpdate });

      setSuccess(`✓ Saved ${changedFields.size} field${changedFields.size > 1 ? 's' : ''}`);
      setChangedFields(new Set());
      setLastSaved(new Date());
    } catch (err: any) {
      console.error('Error saving content:', err);
      setError(err.message || 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (changedFields.size === 0) return;
    if (confirm(`Discard ${changedFields.size} unsaved change${changedFields.size > 1 ? 's' : ''}?`)) {
      fetchContent();
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-8 h-8 mb-2 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Loading content editor...</p>
        </div>
      </div>
    );
  }

  const currentPage = PAGES.find((p) => p.id === currentPageId) || PAGES[0];

  return (
    <div className="p-4 md:p-8 pb-32">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Website Content Editor</h1>
          <p className="text-gray-600 mt-2">Edit all pages and sections of your website</p>
        </div>

        {/* Sticky Unsaved Changes Bar */}
        {changedFields.size > 0 && (
          <div className="fixed bottom-0 left-0 right-0 bg-blue-50 border-t border-blue-200 shadow-lg z-40">
            <div className="max-w-6xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="inline-flex items-center justify-center w-6 h-6 bg-blue-600 text-white rounded-full text-sm font-semibold animate-pulse">
                  {changedFields.size}
                </div>
                <span className="text-sm font-medium text-blue-900">
                  {changedFields.size} unsaved change{changedFields.size > 1 ? 's' : ''}
                </span>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleReset}
                  className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Discard
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-6 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 transition"
                >
                  {saving ? 'Saving...' : `Save (${changedFields.size})`}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Alerts */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start justify-between">
            <p className="text-red-800 text-sm">{error}</p>
            <button onClick={() => setError(null)} className="text-red-600 hover:text-red-700">✕</button>
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start justify-between">
            <p className="text-green-800 text-sm font-medium">{success}</p>
            <button onClick={() => setSuccess(null)} className="text-green-600 hover:text-green-700">✕</button>
          </div>
        )}

        {/* Page Tabs */}
        <div className="mb-8 border-b border-gray-200 overflow-x-auto">
          <div className="flex gap-2">
            {PAGES.map((page) => (
              <button
                key={page.id}
                onClick={() => {
                  setCurrentPageId(page.id);
                  setExpandedGroup('');
                }}
                className={`px-4 py-3 text-sm font-semibold transition-colors whitespace-nowrap ${
                  currentPageId === page.id
                    ? 'text-green-600 border-b-2 border-green-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {page.icon} {page.title}
              </button>
            ))}
          </div>
        </div>

        {/* Info Box */}
        <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900">
            <strong>💡 Tip:</strong> Editing the {currentPage.title} page. Changes are synced to your website in real-time (every 5 seconds).
          </p>
        </div>

        {/* Field Groups */}
        <div className="space-y-6 mb-8">
          {currentPage.groups.map((group) => {
            const groupChanges = Array.from(changedFields).filter((key) =>
              group.fields.some((f) => f.key === key)
            ).length;
            const isExpanded = expandedGroup === group.id;

            return (
              <div key={group.id} className="bg-white rounded-lg border border-gray-200 shadow-sm">
                {/* Group Header */}
                <button
                  onClick={() => setExpandedGroup(isExpanded ? '' : group.id)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition"
                >
                  <div className="flex-1 text-left">
                    <h2 className="text-lg font-bold text-gray-900">{group.title}</h2>
                    <p className="text-sm text-gray-600 mt-1">{group.description}</p>
                  </div>
                  <div className="flex items-center gap-4 ml-4">
                    {groupChanges > 0 && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
                        <span className="inline-block w-2 h-2 bg-yellow-600 rounded-full animate-pulse"></span>
                        {groupChanges} changed
                      </span>
                    )}
                    <span className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}>▼</span>
                  </div>
                </button>

                {/* Group Content */}
                {isExpanded && (
                  <div className="border-t border-gray-200 px-6 py-5 bg-gray-50">
                    <div className="grid grid-cols-1 gap-5">
                      {group.fields.map((field) => {
                        const isChanged = changedFields.has(field.key);
                        const value = content[field.key] || '';
                        return (
                          <div key={field.key} className="relative">
                            {isChanged && (
                              <div className="absolute -left-4 top-0 bottom-0 border-l-4 border-green-500"></div>
                            )}
                            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                              {field.label}
                              {isChanged && (
                                <span className="inline-flex items-center justify-center w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
                              )}
                            </label>
                            {field.type === 'textarea' ? (
                              <textarea
                                value={value}
                                onChange={(e) => handleChange(field.key, e.target.value)}
                                rows={field.rows || 3}
                                className={`w-full px-3 py-2 border-2 rounded-lg focus:outline-none focus:border-green-500 resize-none transition ${
                                  isChanged ? 'border-green-500 bg-green-50' : 'border-gray-300'
                                }`}
                                placeholder={`Enter ${field.label.toLowerCase()}...`}
                              />
                            ) : (
                              <input
                                type={field.type}
                                value={value}
                                onChange={(e) => handleChange(field.key, e.target.value)}
                                className={`w-full px-3 py-2 border-2 rounded-lg focus:outline-none focus:border-green-500 transition ${
                                  isChanged ? 'border-green-500 bg-green-50' : 'border-gray-300'
                                }`}
                                placeholder={`Enter ${field.label.toLowerCase()}...`}
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Statistics Footer */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div>
            <p className="text-xs text-gray-600 font-semibold">Total Pages</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{PAGES.length}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600 font-semibold">Current Fields</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{currentPage.groups.reduce((sum, g) => sum + g.fields.length, 0)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600 font-semibold">Edited</p>
            <p className="text-2xl font-bold text-green-600 mt-1">{changedFields.size}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600 font-semibold">Last Saved</p>
            <p className="text-sm font-semibold text-gray-900 mt-1">
              {lastSaved ? lastSaved.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '—'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
