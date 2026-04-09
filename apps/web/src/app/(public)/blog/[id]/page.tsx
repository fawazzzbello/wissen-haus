'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';

interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  author: string;
  date: string;
  category: string;
}

const BLOG_POSTS: Record<string, BlogPost> = {
  '1': {
    id: '1',
    title: 'Empowering Youth Through Mentorship',
    excerpt:
      'Discover how our mentorship programs are transforming the lives of young people in our community.',
    content: `
      <p>Mentorship is more than just guidance; it's a transformative experience that shapes the future of young people. At Wissen-Haus, we believe that everyone deserves access to mentors who can inspire, guide, and support them on their journey to success.</p>

      <h3>The Power of Connection</h3>
      <p>Our mentorship programs connect young people with experienced professionals who are passionate about making a difference. Through regular meetings and structured programs, mentees gain valuable insights, skills, and confidence.</p>

      <h3>Real Impact Stories</h3>
      <p>Over the past three years, we have matched over 500 mentees with dedicated mentors. The results have been remarkable:</p>
      <ul>
        <li>85% of mentees improved their academic performance</li>
        <li>70% gained skills in their chosen field</li>
        <li>90% reported increased confidence and self-esteem</li>
      </ul>

      <h3>Get Involved</h3>
      <p>Whether you are a young person looking for guidance or a professional willing to mentor, we invite you to join our community. Together, we can create lasting change.</p>
    `,
    author: 'Sarah Johnson',
    date: '2026-04-05',
    category: 'Programs',
  },
  '2': {
    id: '2',
    title: 'Success Story: From Dream to Achievement',
    excerpt:
      'Meet Ahmed, a young leader who transformed his life through our empowerment program.',
    content: `
      <p>Ahmed's journey with Wissen-Haus began three years ago when he was struggling to find direction in life. Today, he's a successful digital entrepreneur and mentor himself.</p>

      <h3>The Beginning</h3>
      <p>Ahmed joined our skills development program at age 18, unsure of his future. Through our comprehensive training, he discovered his passion for digital marketing and entrepreneurship.</p>

      <h3>The Transformation</h3>
      <p>With support from his mentor and the Wissen-Haus community, Ahmed:</p>
      <ul>
        <li>Completed advanced digital marketing certifications</li>
        <li>Started his own digital marketing agency</li>
        <li>Now mentors 10+ young entrepreneurs</li>
      </ul>

      <h3>Ahmed's Message</h3>
      <p>"Wissen-Haus gave me more than skills; it gave me belief in myself. I would not be where I am today without this community. Now, my mission is to help others find their path, just like someone helped me."</p>
    `,
    author: 'Michael Chen',
    date: '2026-03-28',
    category: 'Stories',
  },
  '3': {
    id: '3',
    title: 'Skills Training Impacts Lives',
    excerpt:
      'Our latest skills training batch graduated 50 young professionals.',
    content: `
      <p>This month, we celebrated the graduation of our 12th cohort of the Skills Training Program, with 50 young professionals now equipped with in-demand skills.</p>

      <h3>Program Highlights</h3>
      <p>The three-month intensive program covered:</p>
      <ul>
        <li>Web Development & Design</li>
        <li>Digital Marketing</li>
        <li>Data Analysis</li>
        <li>Business Entrepreneurship</li>
      </ul>

      <h3>Employment Outcomes</h3>
      <p>Of the 50 graduates:</p>
      <ul>
        <li>35 have secured employment in their field</li>
        <li>10 are starting their own businesses</li>
        <li>5 are pursuing advanced certifications</li>
      </ul>

      <p>We are incredibly proud of the progress these young professionals are making and excited to see them contribute to our economy and society.</p>
    `,
    author: 'Emma Williams',
    date: '2026-03-15',
    category: 'Impact',
  },
  '4': {
    id: '4',
    title: 'Community Partnerships Expanding Our Reach',
    excerpt:
      'We are excited to announce our new partnerships with leading organizations.',
    content: `
      <p>Strategic partnerships are crucial to expanding our impact. We are thrilled to announce new collaborations that will help us reach more young people.</p>

      <h3>Our New Partners</h3>
      <p>We have recently partnered with:</p>
      <ul>
        <li><strong>Tech Africa Initiative</strong> - for advanced digital skills training</li>
        <li><strong>Global Youth Foundation</strong> - for international mentorship programs</li>
        <li><strong>Local Business Association</strong> - for job placement support</li>
      </ul>

      <h3>What This Means</h3>
      <p>These partnerships will enable us to:</p>
      <ul>
        <li>Expand our programs to 5 new cities</li>
        <li>Reach 2,000 additional young people this year</li>
        <li>Provide access to world-class training resources</li>
        <li>Create more employment opportunities</li>
      </ul>

      <p>Together, we are building a stronger, more inclusive ecosystem for youth empowerment.</p>
    `,
    author: 'David Okonkwo',
    date: '2026-03-01',
    category: 'News',
  },
};

export default function BlogPostPage() {
  const params = useParams();
  const postId = params.id as string;
  const post = BLOG_POSTS[postId];

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container max-w-4xl px-4">
          <div className="card text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Post Not Found</h1>
            <p className="text-gray-600 mb-6">The blog post you're looking for doesn't exist.</p>
            <Link href="/blog" className="btn-primary inline-block">
              ← Back to Blog
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
        <div className="container max-w-4xl px-4">
          <Link href="/blog" className="text-primary-100 hover:text-white mb-4 inline-block">
            ← Back to Blog
          </Link>
          <h1 className="text-4xl font-bold">{post.title}</h1>
          <div className="flex items-center gap-4 mt-6 text-primary-100">
            <span>{post.author}</span>
            <span>•</span>
            <span>{formatDate(post.date)}</span>
            <span>•</span>
            <span className="px-2 py-1 bg-primary-700 rounded">{post.category}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container max-w-4xl px-4 py-12">
        <article className="card prose prose-lg max-w-none">
          <div
            className="text-gray-700 leading-relaxed space-y-6"
            dangerouslySetInnerHTML={{
              __html: post.content
                .replace(/<p>/g, '<p class="text-gray-700">')
                .replace(/<h3>/g, '<h3 class="text-2xl font-bold text-gray-900 mt-6 mb-3">')
                .replace(/<ul>/g, '<ul class="list-disc list-inside space-y-2 ml-4 text-gray-700">')
                .replace(/<li>/g, '<li class="text-gray-700">'),
            }}
          />
        </article>

        {/* Author Bio */}
        <div className="card mt-12 bg-gray-50">
          <div className="flex gap-6">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-600 to-primary-800 rounded-full flex-shrink-0"></div>
            <div>
              <h3 className="font-bold text-gray-900">{post.author}</h3>
              <p className="text-gray-600 text-sm mt-2">
                {post.author} is a passionate advocate for youth empowerment and a contributor to Wissen-Haus.
              </p>
            </div>
          </div>
        </div>

        {/* Related Posts (could be dynamic in future) */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">More Stories</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.values(BLOG_POSTS)
              .filter((p) => p.id !== postId)
              .slice(0, 2)
              .map((relatedPost) => (
                <Link key={relatedPost.id} href={`/blog/${relatedPost.id}`}>
                  <article className="card hover:shadow-lg transition-shadow cursor-pointer h-full">
                    <h3 className="font-bold text-gray-900 mb-2">{relatedPost.title}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{relatedPost.excerpt}</p>
                    <div className="text-primary-600 font-semibold text-sm">Read More →</div>
                  </article>
                </Link>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
