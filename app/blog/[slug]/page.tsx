import { getPostBySlug, getPostSlugs } from '@/lib/posts'
import { MDXRemote } from 'next-mdx-remote/rsc'
import Link from 'next/link'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) return { title: 'Post Not Found' }
  return {
    title: `${post.title} — YouMeanToBe`,
    description: post.excerpt,
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
          <Link href="/blog" className="text-blue-400 hover:underline">← Back to Blog</Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900">
      <div className="container mx-auto px-4 py-16 max-w-2xl">
        <Link href="/blog" className="text-blue-400 hover:underline text-sm mb-8 inline-block">
          ← Back to Blog
        </Link>
        <article>
          <header className="mb-10">
            <h1 className="text-4xl font-bold text-white mb-3 leading-tight">
              {post.title}
            </h1>
            <p className="text-white/50 text-sm">{post.date}</p>
          </header>
          <div className="prose prose-invert prose-lg max-w-none">
            <MDXRemote source={post.content} />
          </div>
        </article>
      </div>
    </main>
  )
}
