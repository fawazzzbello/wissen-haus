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

interface ContentPage {
  id: string;
  slug: string;
  title: string;
  contentHtml: string;
  metaDescription?: string;
  metaKeywords?: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function HomepageEditor() {
  const [sections, setSections] = useState<HomepageSection[]>([]);
  const [contentPages, setContentPages] = useState<ContentPage[]>([]);
  const [selectedSection, setSelectedSection] = useState<HomepageSection | null>(null);
  const [selectedPage, setSelectedPage] = useState<ContentPage | null>(null);
  const [editMode, setEditMode] = useState<'sections' | 'pages'>('sections');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const api = getApiClient();
      const [sectionsRes, pagesRes] = await Promise.all([
        api.get('/homepage'),
        api.get('/content/admin/pages'),
      ]);
      setSections(sectionsRes.data.sections || []);
      setContentPages(pagesRes.data.pages || []);

      if (sectionsRes.data.sections?.length > 0) {
        setSelectedSection(sectionsRes.data.sections[0]);
        setFormData(sectionsRes.data.sections[0]);
      }
    } catch (error: any) {
      console.error('Error fetching data:', error);
      setError(error.message || 'Failed to load data');
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

  const handleSavePage = async () => {
    if (!selectedPage) return;

    try {
      setSaving(true);
      setError(null);
      const api = getApiClient();

      const payload = {
        title: formData.title,
        slug: formData.slug,
        contentHtml: formData.contentHtml,
        metaDescription: formData.metaDescription,
        metaKeywords: formData.metaKeywords,
        isPublished: formData.isPublished,
      };

      const response = await api.put(`/content/admin/pages/${selectedPage.id}`, payload);

      // Update local state
      const updated = contentPages.map(p =>
        p.id === selectedPage.id ? response.data.page : p
      );
      setContentPages(updated);
      setSelectedPage(response.data.page);
      setFormData(response.data.page);
    } catch (error: any) {
      console.error('Error saving page:', error);
      setError(error.message || 'Failed to save page');
    } finally {
      setSaving(false);
    }
  };

  const handleFieldChange = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-8 h-8 mb-2 border-4 border-primary-600 border-t-transparent rounded-full spinner"></div>
          <p className="text-gray-600">Loading homepage editor...</p>
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
          <p className="text-gray-600 mt-2">Edit homepage sections and content pages</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 mb-3">{error}</p>
            <button onClick={fetchData} className="btn-secondary text-sm">
              Retry
            </button>
          </div>
        )}

        {/* Debug Info - Remove in production */}
        {sections.length === 0 && contentPages.length === 0 && !error && !loading && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 mb-3">
              No data loaded. This may happen if the database hasn't been seeded yet.
            </p>
            <p className="text-yellow-700 text-sm mb-3">
              Please ensure you've run the database migrations and seed script:
            </p>
            <code className="text-xs bg-yellow-100 p-2 rounded block text-yellow-900">
              npm run migrate && npm run seed
            </code>
          </div>
        )}

        {/* Mode Tabs */}
        <div className="mb-6">
          <div className="flex gap-2 border-b border-gray-200">
            <button
              onClick={() => {
                setEditMode('sections');
                if (sections.length > 0) {
                  setSelectedSection(sections[0]);
                  setFormData(sections[0]);
                }
              }}
              className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
                editMode === 'sections'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Homepage Sections
            </button>
            <button
              onClick={() => {
                setEditMode('pages');
                if (contentPages.length > 0) {
                  setSelectedPage(contentPages[0]);
                  setFormData(contentPages[0]);
                }
              }}
              className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
                editMode === 'pages'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Content Pages
            </button>
          </div>
        </div>

        {/* Sections Editor */}
        {editMode === 'sections' && (
          <div>
            {sections.length === 0 ? (
              <div className="card p-6 text-center">
                <p className="text-gray-600">No homepage sections available</p>
              </div>
            ) : (
              <>
                {/* Section Tabs */}
                <div className="mb-6">
                  <div className="flex flex-wrap gap-2 border-b border-gray-200">
                    {sections.map((section) => (
                      <button
                        key={section.id}
                        onClick={() => {
                          setSelectedSection(section);
                          setFormData(section);
                        }}
                        className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
                          selectedSection?.id === section.id
                            ? 'border-primary-600 text-primary-600'
                            : 'border-transparent text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        {section.sectionName.charAt(0).toUpperCase() + section.sectionName.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Section Editor */}
                {selectedSection && (
                  <div className="card">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Edit: {selectedSection.sectionName.toUpperCase()}
                </h2>

                <div className="space-y-6">

                  {/* Section Type */}
                  <div>
                    <label className="label">Section Type</label>
                    <select
                      value={formData.sectionType || 'body'}
                      onChange={(e) => handleFieldChange('sectionType', e.target.value)}
                      className="input"
                    >
                      <option value="hero">Hero (Full-width banner with overlay)</option>
                      <option value="header">Header (Section title with content)</option>
                      <option value="body">Body (Two-column layout)</option>
                      <option value="cta">CTA (Call-to-action section)</option>
                      <option value="stats">Stats (Impact statistics dashboard)</option>
                      <option value="programs">Programs (Services/programs cards)</option>
                      <option value="testimonials">Testimonials (Success stories)</option>
                      <option value="custom">Custom (Free-form HTML)</option>
                      <option value="footer">Footer (Footer section)</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-2">
                      For Stats, Programs, and Testimonials, use structured HTML in the "HTML Content" field.
                    </p>
                  </div>
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
              </>
            )}
          </div>
        )}

        {/* Pages Editor */}
        {editMode === 'pages' && (
          <div>
            {/* Page Tabs */}
            <div className="mb-6">
              <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-2">
                {contentPages.length === 0 ? (
                  <p className="text-gray-600">No content pages found</p>
                ) : (
                  contentPages.map((page) => (
                    <button
                      key={page.id}
                      onClick={() => {
                        setSelectedPage(page);
                        setFormData(page);
                      }}
                      className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
                        selectedPage?.id === page.id
                          ? 'border-primary-600 text-primary-600'
                          : 'border-transparent text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {page.title}
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Page Editor */}
            {selectedPage && (
              <div className="card">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Edit: {selectedPage.title}
                </h2>

                <div className="space-y-6">
                  {/* Title */}
                  <div>
                    <label className="label">Title *</label>
                    <input
                      type="text"
                      value={formData.title || ''}
                      onChange={(e) => handleFieldChange('title', e.target.value)}
                      placeholder="Page title"
                      className="input"
                      required
                    />
                  </div>

                  {/* Slug */}
                  <div>
                    <label className="label">Slug *</label>
                    <input
                      type="text"
                      value={formData.slug || ''}
                      onChange={(e) => handleFieldChange('slug', e.target.value)}
                      placeholder="page-slug"
                      className="input"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">URL-friendly identifier (lowercase, hyphens only)</p>
                  </div>

                  {/* Meta Description */}
                  <div>
                    <label className="label">Meta Description</label>
                    <textarea
                      value={formData.metaDescription || ''}
                      onChange={(e) => handleFieldChange('metaDescription', e.target.value)}
                      placeholder="SEO meta description (160 chars max)"
                      rows={2}
                      className="input resize-none"
                    />
                  </div>

                  {/* Meta Keywords */}
                  <div>
                    <label className="label">Meta Keywords</label>
                    <input
                      type="text"
                      value={formData.metaKeywords || ''}
                      onChange={(e) => handleFieldChange('metaKeywords', e.target.value)}
                      placeholder="keyword1, keyword2, keyword3"
                      className="input"
                    />
                  </div>

                  {/* Content HTML */}
                  <div>
                    <label className="label">Content (HTML) *</label>
                    <textarea
                      value={formData.contentHtml || ''}
                      onChange={(e) => handleFieldChange('contentHtml', e.target.value)}
                      placeholder="<h2>Title</h2><p>Content here...</p>"
                      rows={12}
                      className="input font-mono text-sm resize-none"
                      required
                    />
                  </div>

                  {/* Published Status */}
                  <div>
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={formData.isPublished || false}
                        onChange={(e) => handleFieldChange('isPublished', e.target.checked)}
                        className="w-4 h-4"
                      />
                      <span>Publish this page</span>
                    </label>
                  </div>

                  {/* Save Button */}
                  <div className="flex gap-3 pt-6 border-t">
                    <button
                      onClick={handleSavePage}
                      disabled={saving}
                      className="btn-primary disabled:opacity-50"
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      onClick={() => {
                        setFormData(selectedPage);
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
        )}
      </div>
    </div>
  );
}
