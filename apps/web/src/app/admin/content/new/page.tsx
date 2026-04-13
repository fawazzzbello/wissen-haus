'use client';

// Ensure this page is always rendered dynamically
export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getApiClient } from '@/lib/api-client';

interface NewContentPage {
  slug: string;
  title: string;
  metaDescription: string;
  metaKeywords: string;
  contentHtml: string;
  isPublished: boolean;
}

export default function NewContentPage() {
  const router = useRouter();

  const [formData, setFormData] = useState<NewContentPage>({
    slug: '',
    title: '',
    metaDescription: '',
    metaKeywords: '',
    contentHtml: '',
    isPublished: false,
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const fieldValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData((prev) => ({
      ...prev,
      [name]: fieldValue,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      if (!formData.title || !formData.slug || !formData.contentHtml) {
        throw new Error('Title, slug, and content are required');
      }

      // Auto-generate slug from title if empty
      const slug = formData.slug || formData.title.toLowerCase().replace(/\s+/g, '-');

      const api = getApiClient();
      await api.post('/content/admin/pages', {
        title: formData.title,
        slug,
        contentHtml: formData.contentHtml,
        metaDescription: formData.metaDescription,
        metaKeywords: formData.metaKeywords,
        isPublished: formData.isPublished,
      });

      router.push('/admin/content');
    } catch (err: any) {
      console.error('Error creating page:', err);
      setError(err.message || 'Failed to create page');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-3xl">
        <div className="mb-8">
          <Link href="/admin/content" className="text-primary-600 hover:underline text-sm mb-4 inline-block">
            ← Back to Content
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Create New Page</h1>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <div>
            <label htmlFor="title" className="label">Title *</label>
            <input
              id="title"
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Page title"
              className="input"
              required
            />
          </div>

          <div>
            <label htmlFor="slug" className="label">Slug *</label>
            <input
              id="slug"
              type="text"
              name="slug"
              value={formData.slug}
              onChange={handleChange}
              placeholder="page-slug (auto-generated if empty)"
              className="input"
            />
            <p className="text-xs text-gray-500 mt-1">URL-friendly identifier (lowercase, hyphens only)</p>
          </div>

          <div>
            <label htmlFor="metaDescription" className="label">Meta Description</label>
            <textarea
              id="metaDescription"
              name="metaDescription"
              value={formData.metaDescription}
              onChange={handleChange}
              placeholder="SEO meta description (160 chars max)"
              rows={2}
              className="input resize-none"
            />
          </div>

          <div>
            <label htmlFor="metaKeywords" className="label">Meta Keywords</label>
            <input
              id="metaKeywords"
              type="text"
              name="metaKeywords"
              value={formData.metaKeywords}
              onChange={handleChange}
              placeholder="keyword1, keyword2, keyword3"
              className="input"
            />
          </div>

          <div>
            <label htmlFor="contentHtml" className="label">Content (HTML) *</label>
            <textarea
              id="contentHtml"
              name="contentHtml"
              value={formData.contentHtml}
              onChange={handleChange}
              placeholder="<h2>Title</h2><p>Content here...</p>"
              rows={10}
              className="input font-mono text-sm resize-none"
              required
            />
          </div>

          <div>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                name="isPublished"
                checked={formData.isPublished}
                onChange={handleChange}
                className="w-4 h-4"
              />
              <span>Publish this page immediately</span>
            </label>
          </div>

          <div className="flex gap-3 pt-6 border-t">
            <button
              type="submit"
              disabled={saving}
              className="btn-primary disabled:opacity-50"
            >
              {saving ? 'Creating...' : 'Create Page'}
            </button>
            <Link href="/admin/content" className="btn-secondary">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
