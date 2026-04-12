'use client';

// Ensure this page is always rendered dynamically
export const dynamic = 'force-dynamic';


import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getApiClient } from '@/lib/api-client';

interface ContentPage {
  id: string;
  slug: string;
  title: string;
  metaDescription: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function ContentPage() {
  const [pages, setPages] = useState<ContentPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      setLoading(true);
      setError(null);
      const api = getApiClient();
      const response = await api.get('/content/admin/pages');
      setPages(response.data.pages || []);
    } catch (error: any) {
      console.error('Error fetching content pages:', error);
      setError(error.message || 'Failed to load content pages');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (pageId: string) => {
    if (!confirm('Are you sure you want to delete this page?')) return;

    try {
      const api = getApiClient();
      await api.delete(`/content/admin/pages/${pageId}`);
      setPages((prev) => prev.filter((p) => p.id !== pageId));
    } catch (error) {
      console.error('Error deleting page:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-7xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Content Pages</h1>
            <p className="text-gray-600 mt-2 text-sm md:text-base">Manage website pages and content</p>
          </div>
          <Link href="/admin/content/new" className="btn-primary text-sm">
            + New Page
          </Link>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 mb-3">{error}</p>
            <button
              onClick={fetchPages}
              className="btn-secondary text-sm"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Pages List */}
        <div className="card">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-8 h-8 mb-2 border-4 border-primary-600 border-t-transparent rounded-full spinner"></div>
                <p className="text-gray-600">Loading content pages...</p>
              </div>
            </div>
          ) : pages.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">No content pages yet</p>
              <Link href="/admin/content/new" className="inline-block btn-primary text-sm">
                Create First Page
              </Link>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-2 md:px-4 font-semibold">Title</th>
                      <th className="hidden sm:table-cell text-left py-3 px-2 md:px-4 font-semibold">Slug</th>
                      <th className="text-left py-3 px-2 md:px-4 font-semibold">Status</th>
                      <th className="hidden md:table-cell text-left py-3 px-2 md:px-4 font-semibold">Updated</th>
                      <th className="text-left py-3 px-2 md:px-4 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pages.map((page) => (
                      <tr key={page.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-2 md:px-4 font-medium text-gray-900 truncate">{page.title}</td>
                        <td className="hidden sm:table-cell py-3 px-2 md:px-4 text-xs text-gray-600">/{page.slug}</td>
                        <td className="py-3 px-2 md:px-4">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              page.isPublished
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {page.isPublished ? 'Published' : 'Draft'}
                          </span>
                        </td>
                        <td className="hidden md:table-cell py-3 px-2 md:px-4 text-xs text-gray-600">
                          {formatDate(page.updatedAt)}
                        </td>
                        <td className="py-3 px-2 md:px-4 space-x-2 text-xs">
                          <Link
                            href={`/admin/content/${page.id}`}
                            className="text-primary-600 hover:underline"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDelete(page.id)}
                            className="text-red-600 hover:underline"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-gray-500 mt-4">Total: {pages.length} pages</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
