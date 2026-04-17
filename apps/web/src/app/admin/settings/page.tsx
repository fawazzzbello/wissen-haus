'use client';

// Ensure this page is always rendered dynamically
export const dynamic = 'force-dynamic';


import { useEffect, useState } from 'react';
import { getApiClient } from '@/lib/api-client';

interface BrandingSettings {
  [key: string]: string;
}

interface EmailSettings {
  fromEmail: string;
  fromName: string;
  enabled: boolean;
}

interface SmsSettings {
  phoneNumber: string;
  enabled: boolean;
}

export default function SettingsPage() {
  const [brandingSettings, setBrandingSettings] = useState<BrandingSettings>({});
  const [emailSettings, setEmailSettings] = useState<EmailSettings>({
    fromEmail: '',
    fromName: '',
    enabled: false,
  });

  const [smsSettings, setSmsSettings] = useState<SmsSettings>({
    phoneNumber: '',
    enabled: false,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [changedBranding, setChangedBranding] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const api = getApiClient();

      const [emailRes, smsRes, brandingRes] = await Promise.all([
        api.get('/notifications/email/settings'),
        api.get('/notifications/sms/settings'),
        api.get('/settings'),
      ]);

      setEmailSettings(emailRes.data);
      setSmsSettings(smsRes.data);
      setBrandingSettings(brandingRes.data.settings || {});
    } catch (error) {
      console.error('Error fetching settings:', error);
      setMessage('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleBrandingChange = (key: string, value: string) => {
    setBrandingSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
    setChangedBranding((prev) => new Set(prev).add(key));
  };

  const handleEmailChange = (field: keyof EmailSettings, value: any) => {
    setEmailSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSmsChange = (field: keyof SmsSettings, value: any) => {
    setSmsSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const saveBrandingSettings = async () => {
    if (changedBranding.size === 0) {
      setMessage('No changes to save');
      return;
    }

    try {
      setSaving(true);
      const api = getApiClient();
      const updates: Record<string, string> = {};
      changedBranding.forEach(key => {
        updates[key] = brandingSettings[key] || '';
      });
      await api.post('/settings/admin/bulk', updates);
      setMessage('Branding settings saved successfully');
      setChangedBranding(new Set());
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error saving branding settings:', error);
      setMessage('Failed to save branding settings');
    } finally {
      setSaving(false);
    }
  };

  const saveEmailSettings = async () => {
    try {
      setSaving(true);
      const api = getApiClient();
      await api.post('/notifications/email/settings', emailSettings);
      setMessage('Email settings saved successfully');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error saving email settings:', error);
      setMessage('Failed to save email settings');
    } finally {
      setSaving(false);
    }
  };

  const saveSmsSettings = async () => {
    try {
      setSaving(true);
      const api = getApiClient();
      await api.post('/notifications/sms/settings', smsSettings);
      setMessage('SMS settings saved successfully');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error saving SMS settings:', error);
      setMessage('Failed to save SMS settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 md:p-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">Settings</h1>
        <div className="card">
          <div className="flex justify-center py-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-8 h-8 mb-2 border-4 border-primary-600 border-t-transparent rounded-full spinner"></div>
              <p className="text-gray-600">Loading settings...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-4xl">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">Settings</h1>

        {message && (
          <div className={`mb-6 p-4 rounded-lg ${message.includes('successfully') ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <p className={message.includes('successfully') ? 'text-green-800' : 'text-red-800'}>
              {message}
            </p>
          </div>
        )}

        {/* Branding Settings */}
        <div className="card mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Site Branding & Logo</h2>

          <div className="space-y-4">
            <div>
              <label className="label">Site Name</label>
              <input
                type="text"
                value={brandingSettings.site_name || ''}
                onChange={(e) => handleBrandingChange('site_name', e.target.value)}
                placeholder="Wissen-Haus"
                className="input"
              />
            </div>

            <div>
              <label className="label">Site Tagline</label>
              <input
                type="text"
                value={brandingSettings.site_tagline || ''}
                onChange={(e) => handleBrandingChange('site_tagline', e.target.value)}
                placeholder="Empowering Future Leaders Through Education"
                className="input"
              />
            </div>

            <div>
              <label className="label">Logo URL</label>
              <input
                type="url"
                value={brandingSettings.logo_url || ''}
                onChange={(e) => handleBrandingChange('logo_url', e.target.value)}
                placeholder="https://example.com/logo.png"
                className="input"
              />
              {brandingSettings.logo_url && (
                <div className="mt-2 p-3 bg-gray-50 rounded border border-gray-200">
                  <p className="text-xs text-gray-600 mb-2">Logo Preview:</p>
                  <img
                    src={brandingSettings.logo_url}
                    alt="Logo"
                    className="max-h-16"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>

            <div>
              <label className="label">Favicon URL</label>
              <input
                type="url"
                value={brandingSettings.favicon_url || ''}
                onChange={(e) => handleBrandingChange('favicon_url', e.target.value)}
                placeholder="https://example.com/favicon.ico"
                className="input"
              />
              {brandingSettings.favicon_url && (
                <div className="mt-2 p-3 bg-gray-50 rounded border border-gray-200">
                  <p className="text-xs text-gray-600 mb-2">Favicon Preview:</p>
                  <img
                    src={brandingSettings.favicon_url}
                    alt="Favicon"
                    className="w-6 h-6"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Primary Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={brandingSettings.primary_color || '#3052d5'}
                    onChange={(e) => handleBrandingChange('primary_color', e.target.value)}
                    className="h-10 w-16 rounded border border-gray-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={brandingSettings.primary_color || ''}
                    onChange={(e) => handleBrandingChange('primary_color', e.target.value)}
                    placeholder="#3052d5"
                    className="flex-1 input"
                  />
                </div>
              </div>

              <div>
                <label className="label">Secondary Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={brandingSettings.secondary_color || '#d81b60'}
                    onChange={(e) => handleBrandingChange('secondary_color', e.target.value)}
                    className="h-10 w-16 rounded border border-gray-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={brandingSettings.secondary_color || ''}
                    onChange={(e) => handleBrandingChange('secondary_color', e.target.value)}
                    placeholder="#d81b60"
                    className="flex-1 input"
                  />
                </div>
              </div>
            </div>

            <div>
              <button
                onClick={saveBrandingSettings}
                disabled={saving || changedBranding.size === 0}
                className="btn-primary disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Branding Settings'}
              </button>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="card mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Contact Information</h2>

          <div className="space-y-4">
            <div>
              <label className="label">Contact Email</label>
              <input
                type="email"
                value={brandingSettings.contact_email || ''}
                onChange={(e) => handleBrandingChange('contact_email', e.target.value)}
                placeholder="hello@wissen-haus.org"
                className="input"
              />
            </div>

            <div>
              <label className="label">Phone Number</label>
              <input
                type="tel"
                value={brandingSettings.phone_number || ''}
                onChange={(e) => handleBrandingChange('phone_number', e.target.value)}
                placeholder="+1 (555) 123-4567"
                className="input"
              />
            </div>

            <div>
              <button
                onClick={saveBrandingSettings}
                disabled={saving || changedBranding.size === 0}
                className="btn-primary disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Contact Information'}
              </button>
            </div>
          </div>
        </div>

        {/* Email Settings */}
        <div className="card mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Email Notifications</h2>

          <div className="space-y-4">
            <div>
              <label className="label">
                <input
                  type="checkbox"
                  checked={emailSettings.enabled}
                  onChange={(e) => handleEmailChange('enabled', e.target.checked)}
                  className="mr-2"
                />
                Enable Email Notifications
              </label>
            </div>

            <div>
              <label className="label">From Email Address</label>
              <input
                type="email"
                value={emailSettings.fromEmail}
                onChange={(e) => handleEmailChange('fromEmail', e.target.value)}
                placeholder="noreply@wissen-haus.org"
                className="input"
              />
              <p className="text-xs text-gray-500 mt-1">Email address that appears as sender</p>
            </div>

            <div>
              <label className="label">From Name</label>
              <input
                type="text"
                value={emailSettings.fromName}
                onChange={(e) => handleEmailChange('fromName', e.target.value)}
                placeholder="Wissen-Haus"
                className="input"
              />
              <p className="text-xs text-gray-500 mt-1">Name that appears in email sender</p>
            </div>

            <div>
              <button
                onClick={saveEmailSettings}
                disabled={saving}
                className="btn-primary disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Email Settings'}
              </button>
            </div>
          </div>
        </div>

        {/* SMS Settings */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-6">SMS Notifications</h2>

          <div className="space-y-4">
            <div>
              <label className="label">
                <input
                  type="checkbox"
                  checked={smsSettings.enabled}
                  onChange={(e) => handleSmsChange('enabled', e.target.checked)}
                  className="mr-2"
                />
                Enable SMS Notifications
              </label>
            </div>

            <div>
              <label className="label">Phone Number</label>
              <input
                type="tel"
                value={smsSettings.phoneNumber}
                onChange={(e) => handleSmsChange('phoneNumber', e.target.value)}
                placeholder="+1234567890"
                className="input"
              />
              <p className="text-xs text-gray-500 mt-1">Twilio phone number for SMS notifications</p>
            </div>

            <div>
              <button
                onClick={saveSmsSettings}
                disabled={saving}
                className="btn-primary disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save SMS Settings'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
