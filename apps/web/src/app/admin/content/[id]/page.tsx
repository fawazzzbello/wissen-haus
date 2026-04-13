'use client';

// Ensure this page is always rendered dynamically
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { getApiClient } from '@/lib/api-client';

interface ContentPage {
  id: string;
  slug: string;
  title: string;
  metaDescription: string;
  metaKeywords: string;
  contentHtml: string;
  isPublished: boolean;
}

export default function EditContentPage() {
  const router = useRouter();
  const params = useParams();
  const pageId = params.id as string;

  const [formData, setFormData] = useState<ContentPage>({
    id: '',
    slug: '',
    title: '',
    metaDescription: '',
    metaKeywords: '',
    contentHtml: '',
    isPublished: false,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchPage();
  }, [pageId]);

  const fetchPage = async () => {
    try {
      const api = getApiClient();
      const response = await api.get(`/content/admin/pages/${pageId}`);
      setFormData(response.data.page);
    } catch (err) {
      console.error('Error fetching page:', err);
      setError('Failed to load page');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
    setSuccess(false);

    try {
      if (!formData.title || !formData.slug || !formData.contentHtml) {
        throw new Error('Title, slug, and content are required');
      }

      const api = getApiClient();
      await api.put(`/content/admin/pages/${pageId}`, {
        title: formData.title,
        slug: formData.slug,
        contentHtml: formData.contentHtml,
        metaDescription: formData.metaDescription,
        metaKeywords: formData.metaKeywords,
        isPublished: formData.isPublished,
      });

      setSuccess(true);
      setTimeout(() => {
        router.push('/admin/content');
      }, 2000);
    } catch (err: any) {
      console.error('Error updating page:', err);
      setError(err.message || 'Failed to update page');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 md:p-8">
        <div className="flex justify-center py-12">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-8 h-8 mb-2 border-4 border-primary-600 border-t-transparent rounded-full spinner"></div>
            <p className="text-gray-600">Loading page...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-3xl">
        <div className="mb-8">
          <Link href="/admin/content" className="text-primary-600 hover:underline text-sm mb-4 inline-block">
            ← Back to Content
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Edit Page</h1>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-700 text-sm">Page updated successfully! Redirecting...</p>
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
              placeholder="page-slug"
              className="input"
              required
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
              <span>Publish this page</span>
            </label>
          </div>

          <div className="flex gap-3 pt-6 border-t">
            <button
              type="submit"
              disabled={saving}
              className="btn-primary disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Page'}
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
