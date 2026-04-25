import { getPostBySlug, getPostSlugs } from '@/lib/posts'
import { AGE_GROUP_META, CATEGORY_META } from '@/types/post'
import { MDXRemote } from 'next-mdx-remote/rsc'
import Link from 'next/link'
import type { Metadata } from 'next'
import { DifficultyBadge } from '@/components/DifficultyBadge'
import { BookmarkButton } from '@/components/BookmarkButton'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) return { title: 'Post Not Found' }
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://youmeantobe.com'
  return {
    title: `${post.title} — YouMeanToBe`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.date,
      authors: ['YouMeanToBe'],
      images: [
        {
          url: `${baseUrl}/api/og?slug=${encodeURIComponent(slug)}`,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: [`${baseUrl}/api/og?slug=${encodeURIComponent(slug)}`],
    },
  }
}

export async function generateStaticParams() {
  return getPostSlugs().map(slug => ({ slug }))
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const post = getPostBySlug(slug)

  if (!post) {
    return (
      <main className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Post Not Found</h1>
          <Link href="/blog" className="text-blue-400 hover:underline">&larr; Back to Blog</Link>
        </div>
      </main>
    )
  }

  const ageMeta = AGE_GROUP_META[post.ageGroup]
  const catMeta = CATEGORY_META[post.category]

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900">
      <article className="max-w-2xl mx-auto px-6 pt-20 pb-24">
        {/* Breadcrumb */}
        <nav className="flex flex-wrap items-center gap-1.5 text-xs text-white/30 mb-8">
          <Link href="/blog" className="hover:text-white/60 transition-colors">Blog</Link>
          <span>/</span>
          <Link href={`/blog?category=${post.category}`} className="hover:text-white/60 transition-colors">
            {catMeta.label}
          </Link>
          <span>/</span>
          <span className="text-white/50 truncate max-w-[200px]">{post.title}</span>
        </nav>

        {/* Header */}
        <header className="mb-10">
          {/* Color accent */}
          <div className={`h-1 w-16 rounded-full bg-gradient-to-r ${post.coverColor} mb-6`} />

          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight tracking-tight">
            {post.title}
          </h1>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className="text-white/40">{post.date}</span>
            <span className="text-white/15">|</span>
            <span className="text-white/40">{post.readingTime} min read</span>
            <span className="text-white/15">|</span>
            <DifficultyBadge difficulty={post.difficulty} />
            <Link
              href={`/collections/${post.ageGroup}`}
              className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-gradient-to-r ${ageMeta.accent} text-white hover:opacity-80 transition-opacity`}
            >
              {ageMeta.icon} {ageMeta.label}
            </Link>
            <BookmarkButton postSlug={post.slug} />
          </div>
        </header>

        {/* Content */}
        <div className="prose prose-invert prose-lg max-w-none prose-headings:tracking-tight prose-p:text-white/70 prose-a:text-blue-400 prose-strong:text-white prose-code:text-emerald-400">
          <MDXRemote source={post.content} />
        </div>

        {/* Footer nav */}
        <div className="mt-16 pt-8 border-t border-white/[0.06] flex flex-wrap gap-4">
          <Link href="/blog" className="text-sm text-white/40 hover:text-white/70 transition-colors">
            &larr; All articles
          </Link>
          <Link
            href={`/collections/${post.ageGroup}`}
            className="text-sm text-white/40 hover:text-white/70 transition-colors"
          >
            More in {ageMeta.label} &rarr;
          </Link>
        </div>
      </article>
    </main>
  )
}
