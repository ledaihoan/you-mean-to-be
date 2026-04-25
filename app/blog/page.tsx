import Link from 'next/link'
import { getAllPosts, CATEGORY_META } from '@/lib/posts'
import type { Category } from '@/lib/posts'
import { ArticleCard } from '@/components/ArticleCard'

export const metadata = {
  title: 'Blog — YouMeanToBe',
  description: 'Science explainers, tutorials, and reflections — deep dives into how the universe built you.',
  openGraph: {
    title: 'Blog — YouMeanToBe',
    description: 'Science explainers, tutorials, and reflections — deep dives into how the universe built you.',
    images: [{ url: '/api/og', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/api/og'],
  },
}

interface Props {
  searchParams: Promise<{ category?: string }>
}

export default async function BlogPage({ searchParams }: Props) {
  const { category } = await searchParams
  let posts = getAllPosts()

  const allCategories = [...new Set(posts.map(p => p.category))] as Category[]

  if (category && Object.keys(CATEGORY_META).includes(category)) {
    posts = posts.filter(p => p.category === category)
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900">
      <div className="max-w-5xl mx-auto px-6 pt-20 pb-24">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">Blog</h1>
          <p className="text-white/40 max-w-lg leading-relaxed">
            Science explainers, tutorials, and reflections — deep dives into how the universe built you.
          </p>
        </div>

        {/* Category filters */}
        <div className="flex flex-wrap items-center gap-2 mb-8">
          <Link
            href="/blog"
            className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
              !category
                ? 'bg-white/10 border-white/20 text-white'
                : 'bg-transparent border-white/[0.06] text-white/40 hover:text-white/70 hover:border-white/15'
            }`}
          >
            All
          </Link>
          {allCategories.map(cat => {
            const catMeta = CATEGORY_META[cat]
            return (
              <Link
                key={cat}
                href={`/blog?category=${cat}`}
                className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
                  category === cat
                    ? 'bg-white/10 border-white/20 text-white'
                    : 'bg-transparent border-white/[0.06] text-white/40 hover:text-white/70 hover:border-white/15'
                }`}
              >
                {catMeta.label}
              </Link>
            )
          })}
        </div>

        {/* Articles */}
        {posts.length === 0 ? (
          <p className="text-white/30 text-center py-16">No posts found.</p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-5">
            {posts.map(post => (
              <ArticleCard key={post.slug} post={post} />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
