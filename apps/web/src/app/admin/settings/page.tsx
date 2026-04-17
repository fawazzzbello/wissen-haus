'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { getApiClient } from '@/lib/api-client';

interface Settings {
  [key: string]: string;
}

const SETTING_GROUPS = [
  {
    name: 'Hero Section',
    icon: '🎯',
    fields: [
      { key: 'hero_title', label: 'Hero Title', type: 'text' },
      { key: 'hero_subtitle', label: 'Hero Subtitle', type: 'text' },
      { key: 'hero_description', label: 'Hero Description', type: 'textarea' },
      { key: 'hero_button_text', label: 'Hero Button Text', type: 'text' },
    ],
  },
  {
    name: 'Mission & Vision',
    icon: '📖',
    fields: [
      { key: 'mission_title', label: 'Mission Title', type: 'text' },
      { key: 'mission_description', label: 'Mission Description', type: 'textarea' },
      { key: 'vision_title', label: 'Vision Title', type: 'text' },
      { key: 'vision_description', label: 'Vision Description', type: 'textarea' },
    ],
  },
  {
    name: 'Impact Statistics',
    icon: '📊',
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
    name: 'Programs (1-3)',
    icon: '📚',
    fields: [
      { key: 'program1_title', label: 'Program 1 Title', type: 'text' },
      { key: 'program1_desc', label: 'Program 1 Description', type: 'textarea' },
      { key: 'program2_title', label: 'Program 2 Title', type: 'text' },
      { key: 'program2_desc', label: 'Program 2 Description', type: 'textarea' },
      { key: 'program3_title', label: 'Program 3 Title', type: 'text' },
      { key: 'program3_desc', label: 'Program 3 Description', type: 'textarea' },
    ],
  },
  {
    name: 'Programs (4-6)',
    icon: '💼',
    fields: [
      { key: 'program4_title', label: 'Program 4 Title', type: 'text' },
      { key: 'program4_desc', label: 'Program 4 Description', type: 'textarea' },
      { key: 'program5_title', label: 'Program 5 Title', type: 'text' },
      { key: 'program5_desc', label: 'Program 5 Description', type: 'textarea' },
      { key: 'program6_title', label: 'Program 6 Title', type: 'text' },
      { key: 'program6_desc', label: 'Program 6 Description', type: 'textarea' },
    ],
  },
  {
    name: 'Testimonials',
    icon: '⭐',
    fields: [
      { key: 'testimonial1_quote', label: 'Testimonial 1 Quote', type: 'textarea' },
      { key: 'testimonial1_author', label: 'Testimonial 1 Author', type: 'text' },
      { key: 'testimonial1_role', label: 'Testimonial 1 Role', type: 'text' },
      { key: 'testimonial2_quote', label: 'Testimonial 2 Quote', type: 'textarea' },
      { key: 'testimonial2_author', label: 'Testimonial 2 Author', type: 'text' },
      { key: 'testimonial2_role', label: 'Testimonial 2 Role', type: 'text' },
      { key: 'testimonial3_quote', label: 'Testimonial 3 Quote', type: 'textarea' },
      { key: 'testimonial3_author', label: 'Testimonial 3 Author', type: 'text' },
      { key: 'testimonial3_role', label: 'Testimonial 3 Role', type: 'text' },
    ],
  },
  {
    name: 'Call to Action',
    icon: '💚',
    fields: [
      { key: 'cta_title', label: 'CTA Title', type: 'text' },
      { key: 'cta_description', label: 'CTA Description', type: 'textarea' },
      { key: 'cta_button_text', label: 'CTA Button Text', type: 'text' },
    ],
  },
  {
    name: 'Branding',
    icon: '🎨',
    fields: [
      { key: 'site_name', label: 'Site Name', type: 'text' },
      { key: 'site_tagline', label: 'Site Tagline', type: 'text' },
      { key: 'logo_url', label: 'Logo URL', type: 'url' },
      { key: 'favicon_url', label: 'Favicon URL', type: 'url' },
    ],
  },
  {
    name: 'Contact Information',
    icon: '📞',
    fields: [
      { key: 'contact_email', label: 'Contact Email', type: 'email' },
      { key: 'phone_number', label: 'Phone Number', type: 'tel' },
    ],
  },
  {
    name: 'Social Media',
    icon: '🔗',
    fields: [
      { key: 'social_twitter', label: 'Twitter URL', type: 'url' },
      { key: 'social_facebook', label: 'Facebook URL', type: 'url' },
      { key: 'social_linkedin', label: 'LinkedIn URL', type: 'url' },
    ],
  },
];

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [changedKeys, setChangedKeys] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const api = getApiClient();
      const response = await api.get('/settings');
      setSettings(response.data.settings || {});
      setChangedKeys(new Set());
    } catch (error: any) {
      setError('Failed to fetch settings');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setChangedKeys(prev => new Set(prev).add(key));
  };

  const handleSave = async () => {
    if (changedKeys.size === 0) {
      setError('No changes to save');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      const api = getApiClient();

      const updates: Record<string, string> = {};
      changedKeys.forEach(key => {
        updates[key] = settings[key] || '';
      });

      await api.post('/settings/admin/bulk', updates);
      setSuccess(`✅ ${changedKeys.size} setting${changedKeys.size !== 1 ? 's' : ''} saved!`);
      setChangedKeys(new Set());
    } catch (error: any) {
      setError('Failed to save settings');
      console.error('Error:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 mb-4 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Homepage Content Settings</h1>
          <p className="text-gray-600 mt-2">Customize every element of your homepage. Changes appear immediately.</p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded">
            {success}
          </div>
        )}

        {/* Settings Groups */}
        <div className="space-y-8">
          {SETTING_GROUPS.map(group => (
            <div key={group.name} className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Group Header */}
              <div className="bg-gradient-to-r from-green-600 to-red-600 px-6 py-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-3">
                  <span className="text-2xl">{group.icon}</span>
                  {group.name}
                </h2>
              </div>

              {/* Group Fields */}
              <div className="p-6 space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {group.fields.map(field => (
                    <div key={field.key}>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {field.label}
                      </label>
                      {field.type === 'textarea' ? (
                        <textarea
                          value={settings[field.key] || ''}
                          onChange={(e) => handleChange(field.key, e.target.value)}
                          className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200"
                          rows={3}
                        />
                      ) : (
                        <input
                          type={field.type}
                          value={settings[field.key] || ''}
                          onChange={(e) => handleChange(field.key, e.target.value)}
                          className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200"
                        />
                      )}
                      {changedKeys.has(field.key) && (
                        <p className="text-sm text-green-600 mt-1">✓ Unsaved changes</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Save Button */}
        <div className="mt-8 flex gap-4">
          <button
            onClick={handleSave}
            disabled={changedKeys.size === 0 || saving}
            className="px-8 py-3 bg-gradient-to-r from-green-600 to-red-600 text-white rounded-lg font-bold hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
          >
            {saving ? 'Saving...' : `Save ${changedKeys.size > 0 ? `(${changedKeys.size})` : ''}`}
          </button>
          <button
            onClick={() => {
              fetchSettings();
              setError(null);
            }}
            disabled={saving}
            className="px-8 py-3 bg-gray-300 text-gray-900 rounded-lg font-bold hover:bg-gray-400 transition-all duration-300"
          >
            Discard Changes
          </button>
        </div>

        {/* Info Box */}
        <div className="mt-12 p-6 bg-blue-50 border-l-4 border-blue-500 rounded-lg">
          <p className="text-blue-700">
            <strong>💡 Tip:</strong> All changes you make here are saved to the database and appear on your homepage immediately.
            No coding required!
          </p>
        </div>
      </div>
    </div>
  );
}
