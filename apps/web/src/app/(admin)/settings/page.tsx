'use client';

import { useEffect, useState } from 'react';
import { getApiClient } from '@/lib/api-client';

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

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const api = getApiClient();

      const [emailRes, smsRes] = await Promise.all([
        api.get('/notifications/email/settings'),
        api.get('/notifications/sms/settings'),
      ]);

      setEmailSettings(emailRes.data);
      setSmsSettings(smsRes.data);
    } catch (error) {
      console.error('Error fetching settings:', error);
      setMessage('Failed to load settings');
    } finally {
      setLoading(false);
    }
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
      <div className="p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Settings</h1>
        <div className="card">
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Settings</h1>

        {message && (
          <div className={`mb-6 p-4 rounded-lg ${message.includes('successfully') ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <p className={message.includes('successfully') ? 'text-green-800' : 'text-red-800'}>
              {message}
            </p>
          </div>
        )}

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
