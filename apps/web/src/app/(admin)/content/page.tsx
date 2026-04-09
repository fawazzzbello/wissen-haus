'use client';

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

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      setLoading(true);
      const api = getApiClient();
      const response = await api.get('/content/admin/pages');
      setPages(response.data.pages || []);
    } catch (error) {
      console.error('Error fetching content pages:', error);
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
    <div className="p-8">
      <div className="max-w-7xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Content Pages</h1>
            <p className="text-gray-600 mt-2">Manage website pages and content</p>
          </div>
          <Link href="/admin/content/new" className="btn-primary">
            + New Page
          </Link>
        </div>

        {/* Pages List */}
        <div className="card">
          {loading ? (
            <p className="text-gray-600">Loading content pages...</p>
          ) : pages.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">No content pages yet</p>
              <Link href="/admin/content/new" className="inline-block btn-primary">
                Create First Page
              </Link>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold">Title</th>
                      <th className="text-left py-3 px-4 font-semibold">Slug</th>
                      <th className="text-left py-3 px-4 font-semibold">Status</th>
                      <th className="text-left py-3 px-4 font-semibold">Updated</th>
                      <th className="text-left py-3 px-4 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pages.map((page) => (
                      <tr key={page.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium text-gray-900">{page.title}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">/{page.slug}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 rounded text-sm ${
                              page.isPublished
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {page.isPublished ? 'Published' : 'Draft'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {formatDate(page.updatedAt)}
                        </td>
                        <td className="py-3 px-4 space-x-2 text-sm">
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
              <p className="text-sm text-gray-500 mt-4">Total: {pages.length} pages</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
