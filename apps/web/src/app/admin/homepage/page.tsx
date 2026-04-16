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

const SECTION_TYPES = [
  { group: '🎯 Hero & Landing', options: [
    { value: 'hero-premium', label: 'Hero Premium — Full-screen banner with animations' },
    { value: 'cta-banner', label: 'CTA Banner — Call-to-action with background' },
  ]},
  { group: '📊 Statistics & Data', options: [
    { value: 'stats-advanced', label: 'Stats Advanced — Impact metrics dashboard' },
    { value: 'donation-tiers', label: 'Donation Tiers — Pricing / tier cards' },
  ]},
  { group: '📋 Content', options: [
    { value: 'programs-grid', label: 'Programs Grid — Service cards with icons' },
    { value: 'features-list', label: 'Features List — Checkmark feature list' },
    { value: 'two-column-advanced', label: 'Two Column Advanced — Image + text' },
  ]},
  { group: '👥 People & Community', options: [
    { value: 'team', label: 'Team — Team member profiles' },
    { value: 'testimonials-advanced', label: 'Testimonials — Success stories with ratings' },
  ]},
  { group: '📅 Events & Information', options: [
    { value: 'events', label: 'Events — Event listings with dates' },
    { value: 'timeline', label: 'Timeline — Historical milestones' },
    { value: 'faq-accordion', label: 'FAQ Accordion — Expandable Q&A' },
  ]},
  { group: '🔗 Utilities', options: [
    { value: 'newsletter', label: 'Newsletter — Email signup form' },
    { value: 'partners', label: 'Partners — Sponsor / partner logos' },
    { value: 'custom', label: 'Custom — Free-form HTML' },
  ]},
];

export default function HomepageEditor() {
  const [sections, setSections] = useState<HomepageSection[]>([]);
  const [contentPages, setContentPages] = useState<ContentPage[]>([]);
  const [selectedSection, setSelectedSection] = useState<HomepageSection | null>(null);
  const [selectedPage, setSelectedPage] = useState<ContentPage | null>(null);
  const [editMode, setEditMode] = useState<'sections' | 'pages'>('sections');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
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
        sectionType: formData.sectionType,
      };
      const response = await api.put(`/homepage/${selectedSection.sectionName}`, payload);
      const updated = sections.map(s =>
        s.sectionName === selectedSection.sectionName ? response.data.section : s
      );
      setSections(updated);
      setSelectedSection(response.data.section);
      setFormData(response.data.section);
      setSuccess('Section saved successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error: any) {
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
      const updated = contentPages.map(p =>
        p.id === selectedPage.id ? response.data.page : p
      );
      setContentPages(updated);
      setSelectedPage(response.data.page);
      setFormData(response.data.page);
      setSuccess('Page saved successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error: any) {
      setError(error.message || 'Failed to save page');
    } finally {
      setSaving(false);
    }
  };

  const handleFieldChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
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

        {/* Alerts */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex justify-between items-start">
            <p className="text-red-800">{error}</p>
            <button onClick={fetchData} className="btn-secondary text-sm ml-4 flex-shrink-0">Retry</button>
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 font-medium">✓ {success}</p>
          </div>
        )}

        {/* Mode Tabs */}
        <div className="mb-6">
          <div className="flex gap-2 border-b border-gray-200">
            <button
              onClick={() => {
                setEditMode('sections');
                if (sections.length > 0) { setSelectedSection(sections[0]); setFormData(sections[0]); }
              }}
              className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
                editMode === 'sections' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Homepage Sections
            </button>
            <button
              onClick={() => {
                setEditMode('pages');
                if (contentPages.length > 0) { setSelectedPage(contentPages[0]); setFormData(contentPages[0]); }
              }}
              className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
                editMode === 'pages' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Content Pages
            </button>
          </div>
        </div>

        {/* Sections Editor */}
        {editMode === 'sections' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Section List */}
            <div className="lg:col-span-1">
              <div className="card p-0 overflow-hidden">
                <div className="p-4 bg-gray-50 border-b font-semibold text-gray-700 text-sm">Sections</div>
                {sections.length === 0 ? (
                  <p className="p-4 text-gray-600 text-sm">No sections available.</p>
                ) : (
                  <div className="divide-y">
                    {sections.map((section) => (
                      <button
                        key={section.id}
                        onClick={() => { setSelectedSection(section); setFormData(section); }}
                        className={`w-full text-left px-4 py-3 text-sm transition-colors ${
                          selectedSection?.id === section.id
                            ? 'bg-primary-50 text-primary-700 font-semibold border-l-2 border-primary-600'
                            : 'hover:bg-gray-50 text-gray-700'
                        }`}
                      >
                        <div className="font-medium capitalize">{section.sectionName}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{section.sectionType}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Section Editor */}
            <div className="lg:col-span-3">
              {selectedSection ? (
                <div className="card">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 capitalize">{selectedSection.sectionName}</h2>
                      <p className="text-sm text-gray-500 mt-1">Section type: <span className="font-medium text-primary-600">{formData.sectionType}</span></p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setFormData(selectedSection)} className="btn-secondary text-sm">Discard</button>
                      <button onClick={handleSaveSection} disabled={saving} className="btn-primary text-sm disabled:opacity-50">
                        {saving ? 'Saving…' : 'Save Changes'}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-5">
                    {/* Section Type */}
                    <div>
                      <label className="label">Section Type</label>
                      <select
                        value={formData.sectionType || 'custom'}
                        onChange={(e) => handleFieldChange('sectionType', e.target.value)}
                        className="input"
                      >
                        {SECTION_TYPES.map(group => (
                          <optgroup key={group.group} label={group.group}>
                            {group.options.map(opt => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </optgroup>
                        ))}
                      </select>
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
                        rows={4}
                        className="input resize-none"
                      />
                    </div>

                    {/* HTML Content */}
                    <div>
                      <label className="label">
                        HTML Content
                        <span className="ml-2 text-xs font-normal text-gray-500">
                          {['stats-advanced','programs-grid','testimonials-advanced','team','events','timeline','faq-accordion','donation-tiers','partners'].includes(formData.sectionType)
                            ? '— use structured data-* attributes (see guide)'
                            : '— optional custom HTML'}
                        </span>
                      </label>
                      <textarea
                        value={formData.htmlContent || ''}
                        onChange={(e) => handleFieldChange('htmlContent', e.target.value)}
                        placeholder="HTML content..."
                        rows={10}
                        className="input resize-y font-mono text-xs"
                      />
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
                      {formData.imageUrl && (
                        <img src={formData.imageUrl} alt="Preview" className="mt-2 h-24 rounded object-cover" />
                      )}
                    </div>

                    {/* Colors */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="label">Background Color</label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={formData.backgroundColor || '#ffffff'}
                            onChange={(e) => handleFieldChange('backgroundColor', e.target.value)}
                            className="w-10 h-10 rounded cursor-pointer border border-gray-200"
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
                      <div>
                        <label className="label">Text Color</label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={formData.textColor || '#000000'}
                            onChange={(e) => handleFieldChange('textColor', e.target.value)}
                            className="w-10 h-10 rounded cursor-pointer border border-gray-200"
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

                    {/* Button */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="label">Button Text</label>
                        <input
                          type="text"
                          value={formData.buttonText || ''}
                          onChange={(e) => handleFieldChange('buttonText', e.target.value)}
                          placeholder="e.g. Donate Now"
                          className="input"
                        />
                      </div>
                      <div>
                        <label className="label">Button URL</label>
                        <input
                          type="text"
                          value={formData.buttonUrl || ''}
                          onChange={(e) => handleFieldChange('buttonUrl', e.target.value)}
                          placeholder="/donate"
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
                        className="input w-32"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="card text-center py-16 text-gray-500">Select a section to edit</div>
              )}
            </div>
          </div>
        )}

        {/* Pages Editor */}
        {editMode === 'pages' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Page List */}
            <div className="lg:col-span-1">
              <div className="card p-0 overflow-hidden">
                <div className="p-4 bg-gray-50 border-b font-semibold text-gray-700 text-sm">Pages</div>
                {contentPages.length === 0 ? (
                  <p className="p-4 text-gray-600 text-sm">No pages found.</p>
                ) : (
                  <div className="divide-y">
                    {contentPages.map((page) => (
                      <button
                        key={page.id}
                        onClick={() => { setSelectedPage(page); setFormData(page); }}
                        className={`w-full text-left px-4 py-3 text-sm transition-colors ${
                          selectedPage?.id === page.id
                            ? 'bg-primary-50 text-primary-700 font-semibold border-l-2 border-primary-600'
                            : 'hover:bg-gray-50 text-gray-700'
                        }`}
                      >
                        <div className="font-medium">{page.title}</div>
                        <div className="text-xs text-gray-500 mt-0.5">/{page.slug}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Page Editor */}
            <div className="lg:col-span-3">
              {selectedPage ? (
                <div className="card">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">{selectedPage.title}</h2>
                      <p className="text-sm text-gray-500 mt-1">/{selectedPage.slug}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setFormData(selectedPage)} className="btn-secondary text-sm">Discard</button>
                      <button onClick={handleSavePage} disabled={saving} className="btn-primary text-sm disabled:opacity-50">
                        {saving ? 'Saving…' : 'Save Changes'}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <label className="label">Title *</label>
                      <input
                        type="text"
                        value={formData.title || ''}
                        onChange={(e) => handleFieldChange('title', e.target.value)}
                        className="input"
                        required
                      />
                    </div>

                    <div>
                      <label className="label">Slug *</label>
                      <input
                        type="text"
                        value={formData.slug || ''}
                        onChange={(e) => handleFieldChange('slug', e.target.value)}
                        placeholder="page-slug"
                        className="input"
                      />
                      <p className="text-xs text-gray-500 mt-1">Accessible at /{formData.slug}</p>
                    </div>

                    <div>
                      <label className="label">Meta Description</label>
                      <textarea
                        value={formData.metaDescription || ''}
                        onChange={(e) => handleFieldChange('metaDescription', e.target.value)}
                        placeholder="SEO meta description"
                        rows={2}
                        className="input resize-none"
                      />
                    </div>

                    <div>
                      <label className="label">Meta Keywords</label>
                      <input
                        type="text"
                        value={formData.metaKeywords || ''}
                        onChange={(e) => handleFieldChange('metaKeywords', e.target.value)}
                        placeholder="keyword1, keyword2"
                        className="input"
                      />
                    </div>

                    <div>
                      <label className="label">Content (HTML) *</label>
                      <textarea
                        value={formData.contentHtml || ''}
                        onChange={(e) => handleFieldChange('contentHtml', e.target.value)}
                        placeholder="<h2>Title</h2><p>Content...</p>"
                        rows={14}
                        className="input font-mono text-xs resize-y"
                        required
                      />
                    </div>

                    <div>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.isPublished || false}
                          onChange={(e) => handleFieldChange('isPublished', e.target.checked)}
                          className="w-4 h-4"
                        />
                        <span className="font-medium text-gray-700">Publish this page</span>
                      </label>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="card text-center py-16 text-gray-500">Select a page to edit</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
