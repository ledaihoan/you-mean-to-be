import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getDb } from '@/lib/db'
import { nanoid } from 'nanoid'
import { generateSlug } from '@/lib/slug'
import { ensureCommunityTables } from '@/lib/community-tables'

const POSTS_LIMIT = 20

interface PostRow {
  id: string
  user_id: string
  title: string
  content: string
  slug: string
  tags: string[]
  created_at: Date
  author_name: string | null
  author_avatar: string | null
}

interface CountRow {
  count: string
}

interface InsertRow {
  id: string
  user_id: string
  title: string
  content: string
  slug: string
  tags: string[]
  created_at: Date
}

// GET /api/community/posts — list all community posts
export async function GET(request: Request) {
  const sql = getDb()
  await ensureCommunityTables(sql)

  const url = new URL(request.url)
  const offset = Math.max(0, parseInt(url.searchParams.get('offset') ?? '0', 10))

  const totalRows = await sql.unsafe<CountRow[]>(
    'SELECT COUNT(*) as count FROM community_posts WHERE deleted_at IS NULL'
  )
  const total = parseInt(totalRows[0]?.count ?? '0', 10)

  const posts = await sql.unsafe<PostRow[]>(
    `SELECT
      p.id, p.user_id, p.title, p.content, p.slug, p.tags, p.created_at,
      u.name as author_name, u.image as author_avatar
    FROM community_posts p
    JOIN "user" u ON u.id = p.user_id
    WHERE p.deleted_at IS NULL
    ORDER BY p.created_at DESC
    LIMIT $1 OFFSET $2`,
    [POSTS_LIMIT, offset]
  )

  await sql.end()

  const formatted = posts.map(p => ({
    id: p.id,
    userId: p.user_id,
    title: p.title,
    content: p.content,
    slug: p.slug,
    tags: p.tags,
    createdAt: p.created_at instanceof Date ? p.created_at.toISOString() : String(p.created_at),
    authorName: p.author_name,
    authorAvatar: p.author_avatar,
  }))

  return NextResponse.json({ data: formatted, total })
}

// POST /api/community/posts — create a new post
export async function POST(request: Request) {
  const session = await auth.api.getSession()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const title = typeof body.title === 'string' ? body.title.trim() : ''
  const content = typeof body.content === 'string' ? body.content.trim() : ''
  const tags = Array.isArray(body.tags)
    ? (body.tags as unknown[]).filter((t): t is string => typeof t === 'string')
    : []

  if (title.length < 3 || title.length > 120) {
    return NextResponse.json({ error: 'title must be 3–120 characters' }, { status: 400 })
  }
  if (content.length < 10 || content.length > 5000) {
    return NextResponse.json({ error: 'content must be 10–5000 characters' }, { status: 400 })
  }

  const sql = getDb()
  await ensureCommunityTables(sql)

  const slug = await generateSlug(title)
  const id = nanoid()

  const rows = await sql.unsafe<InsertRow[]>(
    `INSERT INTO community_posts (id, user_id, title, content, slug, tags)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, user_id, title, content, slug, tags, created_at`,
    [id, session.user.id, title, content, slug, tags]
  )

  await sql.end()

  const post = rows[0]
  return NextResponse.json({
    data: {
      id: post.id,
      userId: post.user_id,
      title: post.title,
      content: post.content,
      slug: post.slug,
      tags: post.tags,
      createdAt: post.created_at instanceof Date ? post.created_at.toISOString() : String(post.created_at),
    }
  })
}
