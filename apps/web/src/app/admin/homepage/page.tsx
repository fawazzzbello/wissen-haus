'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { getApiClient } from '@/lib/api-client';

interface HomepageSection {
  id: string;
  sectionName: string;
  sectionType: string;
  title?: string;
  subtitle?: string;
  description?: string;
  htmlContent?: string;
  imageUrl?: string;
  backgroundColor?: string;
  textColor?: string;
  buttonText?: string;
  buttonUrl?: string;
  displayOrder: number;
  isActive: boolean;
  updatedAt: string;
}

export default function HomepageEditor() {
  const [sections, setSections] = useState<HomepageSection[]>([]);
  const [selectedSection, setSelectedSection] = useState<HomepageSection | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<HomepageSection>>({});

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    try {
      setLoading(true);
      setError(null);
      const api = getApiClient();
      const response = await api.get('/homepage');
      setSections(response.data.sections || []);
      if (response.data.sections?.length > 0) {
        setSelectedSection(response.data.sections[0]);
        setFormData(response.data.sections[0]);
      }
    } catch (error: any) {
      console.error('Error fetching sections:', error);
      setError(error.message || 'Failed to load homepage sections');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSection = async () => {
    if (!selectedSection) return;

    try {
      setSaving(true);
      setError(null);
      const api = getApiClient();

      const payload = {
        title: formData.title,
        subtitle: formData.subtitle,
        description: formData.description,
        htmlContent: formData.htmlContent,
        imageUrl: formData.imageUrl,
        backgroundColor: formData.backgroundColor,
        textColor: formData.textColor,
        buttonText: formData.buttonText,
        buttonUrl: formData.buttonUrl,
        displayOrder: formData.displayOrder,
      };

      const response = await api.put(`/homepage/${selectedSection.sectionName}`, payload);

      // Update local state
      const updated = sections.map(s =>
        s.sectionName === selectedSection.sectionName ? response.data.section : s
      );
      setSections(updated);
      setSelectedSection(response.data.section);
      setFormData(response.data.section);
    } catch (error: any) {
      console.error('Error saving section:', error);
      setError(error.message || 'Failed to save section');
    } finally {
      setSaving(false);
    }
  };

  const handleFieldChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-8 h-8 mb-2 border-4 border-primary-600 border-t-transparent rounded-full spinner"></div>
          <p className="text-gray-600">Loading homepage sections...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Homepage Editor</h1>
          <p className="text-gray-600 mt-2">Edit homepage sections (hero, header, body, footer)</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 mb-3">{error}</p>
            <button onClick={fetchSections} className="btn-secondary text-sm">
              Retry
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Section List */}
          <div className="lg:col-span-1">
            <div className="card sticky top-4">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Sections</h2>
              <div className="space-y-2">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => {
                      setSelectedSection(section);
                      setFormData(section);
                    }}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                      selectedSection?.id === section.id
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    <p className="font-medium text-sm md:text-base capitalize">{section.sectionName}</p>
                    <p className="text-xs opacity-75">{section.sectionType}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Editor */}
          <div className="lg:col-span-3">
            {selectedSection && (
              <div className="card">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Edit: {selectedSection.sectionName.toUpperCase()}
                </h2>

                <div className="space-y-6">
                  {/* Title */}
                  <div>
                    <label className="label">Title</label>
                    <input
                      type="text"
                      value={formData.title || ''}
                      onChange={(e) => handleFieldChange('title', e.target.value)}
                      placeholder="Section title"
                      className="input"
                    />
                  </div>

                  {/* Subtitle */}
                  <div>
                    <label className="label">Subtitle</label>
                    <input
                      type="text"
                      value={formData.subtitle || ''}
                      onChange={(e) => handleFieldChange('subtitle', e.target.value)}
                      placeholder="Section subtitle"
                      className="input"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="label">Description</label>
                    <textarea
                      value={formData.description || ''}
                      onChange={(e) => handleFieldChange('description', e.target.value)}
                      placeholder="Section description"
                      rows={5}
                      className="input resize-none"
                    />
                  </div>

                  {/* HTML Content */}
                  <div>
                    <label className="label">HTML Content</label>
                    <textarea
                      value={formData.htmlContent || ''}
                      onChange={(e) => handleFieldChange('htmlContent', e.target.value)}
                      placeholder="Custom HTML content (optional)"
                      rows={8}
                      className="input resize-none font-mono text-sm"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Leave empty to use generated content from title, subtitle, and description
                    </p>
                  </div>

                  {/* Image URL */}
                  <div>
                    <label className="label">Image URL</label>
                    <input
                      type="url"
                      value={formData.imageUrl || ''}
                      onChange={(e) => handleFieldChange('imageUrl', e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      className="input"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Background Color */}
                    <div>
                      <label className="label">Background Color</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={formData.backgroundColor || '#ffffff'}
                          onChange={(e) => handleFieldChange('backgroundColor', e.target.value)}
                          className="w-16 h-10 rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          value={formData.backgroundColor || '#ffffff'}
                          onChange={(e) => handleFieldChange('backgroundColor', e.target.value)}
                          placeholder="#ffffff"
                          className="input flex-1"
                        />
                      </div>
                    </div>

                    {/* Text Color */}
                    <div>
                      <label className="label">Text Color</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={formData.textColor || '#000000'}
                          onChange={(e) => handleFieldChange('textColor', e.target.value)}
                          className="w-16 h-10 rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          value={formData.textColor || '#000000'}
                          onChange={(e) => handleFieldChange('textColor', e.target.value)}
                          placeholder="#000000"
                          className="input flex-1"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Button Text */}
                    <div>
                      <label className="label">Button Text</label>
                      <input
                        type="text"
                        value={formData.buttonText || ''}
                        onChange={(e) => handleFieldChange('buttonText', e.target.value)}
                        placeholder="e.g., Learn More"
                        className="input"
                      />
                    </div>

                    {/* Button URL */}
                    <div>
                      <label className="label">Button URL</label>
                      <input
                        type="url"
                        value={formData.buttonUrl || ''}
                        onChange={(e) => handleFieldChange('buttonUrl', e.target.value)}
                        placeholder="e.g., /donate"
                        className="input"
                      />
                    </div>
                  </div>

                  {/* Display Order */}
                  <div>
                    <label className="label">Display Order</label>
                    <input
                      type="number"
                      value={formData.displayOrder || 1}
                      onChange={(e) => handleFieldChange('displayOrder', parseInt(e.target.value))}
                      min="1"
                      className="input"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Lower numbers appear first on the homepage
                    </p>
                  </div>

                  {/* Save Button */}
                  <div className="flex gap-3 pt-6 border-t">
                    <button
                      onClick={handleSaveSection}
                      disabled={saving}
                      className="btn-primary disabled:opacity-50"
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      onClick={() => {
                        setFormData(selectedSection);
                      }}
                      className="btn-secondary"
                    >
                      Discard Changes
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
