'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getApiClient } from '@/lib/api-client';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  category: string;
  image?: string;
}

interface PageContent {
  [key: string]: string;
}

const SAMPLE_POSTS: BlogPost[] = [
  {
    id: '1',
    title: 'Empowering Youth Through Mentorship',
    excerpt:
      'Discover how our mentorship programs are transforming the lives of young people in our community.',
    author: 'Sarah Johnson',
    date: '2026-04-05',
    category: 'Programs',
  },
  {
    id: '2',
    title: 'Success Story: From Dream to Achievement',
    excerpt:
      'Meet Ahmed, a young leader who transformed his life through our empowerment program. Read his inspiring journey.',
    author: 'Michael Chen',
    date: '2026-03-28',
    category: 'Stories',
  },
  {
    id: '3',
    title: 'Skills Training Impacts Lives',
    excerpt:
      'Our latest skills training batch graduated 50 young professionals. See how they are making a difference.',
    author: 'Emma Williams',
    date: '2026-03-15',
    category: 'Impact',
  },
  {
    id: '4',
    title: 'Community Partnerships Expanding Our Reach',
    excerpt:
      'We are excited to announce our new partnerships with leading organizations. Learn more about our collaboration.',
    author: 'David Okonkwo',
    date: '2026-03-01',
    category: 'News',
  },
];

export default function BlogPage() {
  const [content, setContent] = useState<PageContent>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const api = getApiClient();
      const response = await api.get('/settings');
      setContent(response.data.settings || {});
    } catch (error) {
      console.error('Error fetching content:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 mb-4 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-600 to-red-600 text-white py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-5xl font-bold mb-6">{content.blog_title || 'Our Blog'}</h1>
          <p className="text-xl opacity-90 max-w-3xl">
            {content.blog_subtitle || 'Stories, insights, and updates from Wissen-Haus'}
          </p>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {SAMPLE_POSTS.map((post) => (
              <Link key={post.id} href={`/blog/${post.id}`}>
                <article className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 h-full border-t-4 border-green-600 hover:border-red-600">
                  <div className="w-full h-48 bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-5xl">
                    📚
                  </div>

                  <div className="p-6 space-y-4">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold text-green-600 bg-green-50 px-3 py-1 rounded-full">
                        {post.category}
                      </span>
                      <span className="text-xs text-gray-500">{formatDate(post.date)}</span>
                    </div>

                    <h2 className="text-xl font-bold text-gray-900 line-clamp-2 hover:text-green-600 transition-colors">
                      {post.title}
                    </h2>

                    <p className="text-gray-600 line-clamp-3 leading-relaxed">{post.excerpt}</p>

                    <div className="flex items-center justify-between pt-4 border-t">
                      <span className="text-sm text-gray-500">By {post.author}</span>
                      <span className="text-green-600 font-bold text-sm hover:text-red-600 transition-colors">
                        Read More →
                      </span>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>

          {/* Newsletter Section */}
          <div className="bg-gradient-to-r from-green-600 to-red-600 rounded-2xl p-12 text-white">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="text-4xl font-bold mb-4">📬 Stay Updated</h2>
              <p className="text-lg mb-8 opacity-90">
                {content.blog_newsletter_text || 'Subscribe to our newsletter to get the latest stories and updates from Wissen-Haus.'}
              </p>

              <form className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-300"
                />
                <button
                  type="submit"
                  className="px-8 py-3 bg-white text-green-600 font-bold rounded-lg hover:bg-gray-100 transition-colors duration-300 whitespace-nowrap"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-50 py-16 px-4 mt-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4 text-gray-900">Inspired by Our Stories?</h2>
          <p className="text-lg text-gray-600 mb-8">
            Join our community and help us create more inspiring stories of transformation.
          </p>
          <a href="/donate" className="px-8 py-3 bg-gradient-to-r from-green-600 to-red-600 text-white font-bold rounded-lg hover:shadow-lg transition-all duration-300">
            💝 Make a Difference
          </a>
        </div>
      </section>
    </div>
  );
}
