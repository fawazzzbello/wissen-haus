'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getApiClient } from '@/lib/api-client';

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

export default function ContentPageView() {
  const params = useParams();
  const slug = params.slug as string;
  const [page, setPage] = useState<ContentPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPage();
  }, [slug]);

  const fetchPage = async () => {
    try {
      setLoading(true);
      setError(null);
      const api = getApiClient();
      const response = await api.get(`/content/pages/${slug}`);
      setPage(response.data.page);
    } catch (error: any) {
      console.error('Error fetching page:', error);
      setError(error.message || 'Page not found');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-8 h-8 mb-2 border-4 border-primary-600 border-t-transparent rounded-full spinner"></div>
          <p className="text-gray-600">Loading page...</p>
        </div>
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="p-4 md:p-8 min-h-screen">
        <div className="max-w-3xl mx-auto">
          <div className="text-center py-12">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Page Not Found</h1>
            <p className="text-gray-600 mb-6">The page you're looking for doesn't exist.</p>
            <Link href="/" className="btn-primary">
              Go Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-3xl mx-auto">
        {/* Navigation */}
        <Link href="/" className="text-primary-600 hover:underline mb-6 inline-block">
          ← Back to Home
        </Link>

        {/* Page Content */}
        <article className="card">
          <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-4">{page.title}</h1>

          {page.metaDescription && (
            <p className="text-gray-600 mb-6 text-lg">{page.metaDescription}</p>
          )}

          <div className="prose prose-sm md:prose max-w-none text-gray-700 mb-8">
            <div dangerouslySetInnerHTML={{ __html: page.contentHtml }} />
          </div>

          <div className="pt-6 border-t border-gray-200 text-xs text-gray-500">
            <p>Last updated: {new Date(page.updatedAt).toLocaleDateString()}</p>
          </div>
        </article>

        {/* Related Links */}
        <nav className="mt-8">
          <p className="text-sm font-semibold text-gray-900 mb-3">More Pages:</p>
          <ul className="flex flex-wrap gap-2">
            <li>
              <Link href="/about-us" className="text-primary-600 hover:underline text-sm">
                About Us
              </Link>
            </li>
            <li>
              <Link href="/blog" className="text-primary-600 hover:underline text-sm">
                Blog
              </Link>
            </li>
            <li>
              <Link href="/donate" className="text-primary-600 hover:underline text-sm">
                Donate
              </Link>
            </li>
            <li>
              <Link href="/contact" className="text-primary-600 hover:underline text-sm">
                Contact
              </Link>
            </li>
            <li>
              <Link href="/faq" className="text-primary-600 hover:underline text-sm">
                FAQ
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}
