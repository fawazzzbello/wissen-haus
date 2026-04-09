'use client';

import Link from 'next/link';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  category: string;
  image?: string;
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
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-12">
        <div className="container max-w-6xl px-4">
          <h1 className="text-4xl font-bold mb-4">Our Blog</h1>
          <p className="text-lg text-primary-100">
            Stories, insights, and updates from Wissen-Haus
          </p>
        </div>
      </div>

      {/* Blog Posts */}
      <div className="container max-w-6xl px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {SAMPLE_POSTS.map((post) => (
            <Link key={post.id} href={`/blog/${post.id}`}>
              <article className="card h-full hover:shadow-lg transition-shadow cursor-pointer">
                {post.image && (
                  <div className="w-full h-48 bg-gradient-to-br from-primary-600 to-primary-800 rounded-t-lg mb-4"></div>
                )}

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-primary-600 bg-primary-50 px-2 py-1 rounded">
                      {post.category}
                    </span>
                    <span className="text-xs text-gray-500">{formatDate(post.date)}</span>
                  </div>

                  <h2 className="text-xl font-bold text-gray-900 line-clamp-2">{post.title}</h2>

                  <p className="text-gray-600 line-clamp-3">{post.excerpt}</p>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <span className="text-sm text-gray-500">By {post.author}</span>
                    <span className="text-primary-600 font-semibold text-sm hover:underline">
                      Read More →
                    </span>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>

        {/* Subscribe Section */}
        <div className="mt-16 card bg-gradient-to-r from-primary-600 to-primary-800 text-white">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
            <p className="mb-6 text-primary-100">
              Subscribe to our newsletter to get the latest stories and updates from Wissen-Haus.
            </p>

            <form className="flex gap-2">
              <input
                type="email"
                placeholder="your@email.com"
                className="flex-1 px-4 py-2 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-300"
              />
              <button
                type="submit"
                className="px-6 py-2 bg-white text-primary-600 font-semibold rounded-lg hover:bg-primary-50 transition"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
