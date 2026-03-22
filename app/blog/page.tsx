import Link from 'next/link'
import { getAllPosts } from '@/lib/posts'

export const metadata = {
  title: 'Blog — YouMeanToBe',
  description: 'Tutorials, science explainers, and reflections from the YouMeanToBe platform.',
}

export default function BlogPage() {
  const posts = getAllPosts()

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900">
      <div className="container mx-auto px-4 py-16 max-w-3xl">
        <h1 className="text-4xl font-bold text-white mb-2">Blog</h1>
        <p className="text-white/60 mb-12">
          Tutorials, science explainers, and reflections on building a life-growing platform.
        </p>

        {posts.length === 0 ? (
          <p className="text-white/40 text-center py-12">No posts yet. Check back soon.</p>
        ) : (
          <div className="space-y-8">
            {posts.map(post => (
              <article key={post.slug} className="border-b border-white/10 pb-8">
                <Link href={`/blog/${post.slug}`} className="group">
                  <h2 className="text-2xl font-semibold text-white group-hover:text-blue-400 transition-colors mb-2">
                    {post.title}
                  </h2>
                  <p className="text-white/50 text-sm mb-2">{post.date}</p>
                  {post.excerpt && (
                    <p className="text-white/70 leading-relaxed">{post.excerpt}</p>
                  )}
                </Link>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
