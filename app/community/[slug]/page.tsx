import { auth } from '@/lib/auth'
import { getDbFresh } from '@/lib/db'
import { PostDetailClient } from './PostDetailClient'
import type { Metadata } from 'next'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

interface Author {
  id: string
  name: string
  image: string | null
}

interface Comment {
  id: string
  content: string
  created_at: string
  author: Author
}

interface Post {
  id: string
  title: string
  content: string
  slug: string
  tags: string[]
  created_at: string
  author: Author
  reaction_counts: { heart: number; thumbs_up: number; fire: number; rocket: number }
  comment_count: number
  user_reaction: string | null
}

interface Props {
  params: Promise<{ slug: string }>
}

interface PostMetaRow {
  title: string
  content: string
}

interface PostRow {
  id: string
  title: string
  content: string
  slug: string
  tags: string[]
  created_at: Date
  user_id: string
  user_name: string
  user_image: string | null
  heart_count: number | null
  thumbs_count: number | null
  fire_count: number | null
  rocket_count: number | null
  user_reaction: string | null
}

interface CommentRow {
  id: string
  content: string
  created_at: Date
  user_id: string
  user_name: string
  user_image: string | null
}

async function getPostMeta(slug: string): Promise<{ title: string; content: string } | null> {
  const sql = getDbFresh()
  const rows = await sql.unsafe<PostMetaRow[]>(
    'SELECT title, content FROM community_posts WHERE slug = $1 AND deleted_at IS NULL',
    [slug]
  )
  await sql.end()
  return rows[0] ?? null
}

async function getPost(slug: string, userId: string | null): Promise<Post | null> {
  const sql = getDbFresh()

  const rows = await sql.unsafe<PostRow[]>(
    `SELECT
      p.id, p.title, p.content, p.slug, p.tags, p.created_at,
      u.id as user_id, u.name as user_name, u.image as user_image,
      hr.cnt as heart_count, ht.cnt as thumbs_count, fr.cnt as fire_count, rr.cnt as rocket_count,
      ur.type as user_reaction
    FROM community_posts p
    JOIN "user" u ON p.user_id = u.id
    LEFT JOIN LATERAL (SELECT count(*) as cnt FROM community_reactions WHERE post_id = p.id AND type = 'heart') hr ON true
    LEFT JOIN LATERAL (SELECT count(*) as cnt FROM community_reactions WHERE post_id = p.id AND type = 'thumbs_up') ht ON true
    LEFT JOIN LATERAL (SELECT count(*) as cnt FROM community_reactions WHERE post_id = p.id AND type = 'fire') fr ON true
    LEFT JOIN LATERAL (SELECT count(*) as cnt FROM community_reactions WHERE post_id = p.id AND type = 'rocket') rr ON true
    LEFT JOIN community_reactions ur ON ur.post_id = p.id AND ur.user_id = $2
    WHERE p.slug = $1 AND p.deleted_at IS NULL`,
    [slug, userId ?? '']
  )
  await sql.end()

  if (!rows[0]) return null

  const row = rows[0]
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    slug: row.slug,
    tags: row.tags ?? [],
    created_at: row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at),
    author: { id: row.user_id, name: row.user_name ?? '', image: row.user_image },
    reaction_counts: {
      heart: Number(row.heart_count ?? 0),
      thumbs_up: Number(row.thumbs_count ?? 0),
      fire: Number(row.fire_count ?? 0),
      rocket: Number(row.rocket_count ?? 0),
    },
    comment_count: 0,
    user_reaction: row.user_reaction ?? null,
  }
}

async function getComments(postId: string): Promise<Comment[]> {
  const sql = getDbFresh()
  const rows = await sql.unsafe<CommentRow[]>(
    `SELECT c.id, c.content, c.created_at, u.id as user_id, u.name as user_name, u.image as user_image
    FROM community_comments c
    JOIN "user" u ON c.user_id = u.id
    WHERE c.post_id = $1
    ORDER BY c.created_at ASC
    LIMIT 50`,
    [postId]
  )
  await sql.end()
  return rows.map(r => ({
    id: r.id,
    content: r.content,
    created_at: r.created_at instanceof Date ? r.created_at.toISOString() : String(r.created_at),
    author: { id: r.user_id, name: r.user_name ?? '', image: r.user_image },
  }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const meta = await getPostMeta(slug)
  if (!meta) return { title: 'Post Not Found' }
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://youmeantobe.com'
  return {
    title: `${meta.title} — Community — YouMeanToBe`,
    description: meta.content.slice(0, 160),
    openGraph: {
      title: meta.title,
      description: meta.content.slice(0, 160),
      type: 'article',
      images: [{ url: `${baseUrl}/api/og`, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: meta.title,
      images: [`${baseUrl}/api/og`],
    },
  }
}

export default async function PostDetailPage({ params }: Props) {
  const { slug } = await params
  const session = await auth.api.getSession()
  const userId = session?.user?.id ?? null

  const post = await getPost(slug, userId)
  const comments = post ? await getComments(post.id) : []

  if (!post) {
    return (
      <main className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Post Not Found</h1>
          <Link href="/community" className="text-blue-400 hover:underline">&larr; Back to Community</Link>
        </div>
      </main>
    )
  }

  return <PostDetailClient post={post} comments={comments} userId={userId} />
}
