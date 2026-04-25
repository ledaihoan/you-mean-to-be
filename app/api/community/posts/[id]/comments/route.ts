import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getDb } from '@/lib/db'
import { nanoid } from 'nanoid'
import { ensureCommunityTables } from '@/lib/community-tables'

type RouteParams = { params: { id: string } }

const COMMENTS_LIMIT = 50

interface CommentRow {
  id: string
  user_id: string
  content: string
  created_at: Date
  author_name: string | null
  author_avatar: string | null
}

interface InsertRow {
  id: string
  user_id: string
  content: string
  created_at: Date
}

// GET /api/community/posts/[id]/comments — list comments for a post
export async function GET(request: Request, { params }: RouteParams) {
  const sql = getDb()
  await ensureCommunityTables(sql)

  const comments = await sql.unsafe<CommentRow[]>(
    `SELECT
      c.id, c.user_id, c.content, c.created_at,
      u.name as author_name, u.image as author_avatar
    FROM community_comments c
    JOIN "user" u ON u.id = c.user_id
    WHERE c.post_id = $1
    ORDER BY c.created_at DESC
    LIMIT $2`,
    [params.id, COMMENTS_LIMIT]
  )

  await sql.end()

  const formatted = comments.map(c => ({
    id: c.id,
    userId: c.user_id,
    content: c.content,
    createdAt: c.created_at instanceof Date ? c.created_at.toISOString() : String(c.created_at),
    authorName: c.author_name,
    authorAvatar: c.author_avatar,
  }))

  return NextResponse.json({ data: formatted })
}

// POST /api/community/posts/[id]/comments — add a comment
export async function POST(request: Request, { params }: RouteParams) {
  const session = await auth.api.getSession()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const content = typeof body.content === 'string' ? body.content.trim() : ''

  if (content.length < 1 || content.length > 1000) {
    return NextResponse.json({ error: 'content must be 1–1000 characters' }, { status: 400 })
  }

  const sql = getDb()
  await ensureCommunityTables(sql)

  // Verify post exists and is not deleted
  const posts = await sql.unsafe<{ id: string }[]>(
    'SELECT id FROM community_posts WHERE id = $1 AND deleted_at IS NULL',
    [params.id]
  )
  if (posts.length === 0) {
    await sql.end()
    return NextResponse.json({ error: 'Post not found' }, { status: 404 })
  }

  const id = nanoid()
  const rows = await sql.unsafe<InsertRow[]>(
    `INSERT INTO community_comments (id, post_id, user_id, content)
     VALUES ($1, $2, $3, $4)
     RETURNING id, user_id, content, created_at`,
    [id, params.id, session.user.id, content]
  )

  await sql.end()

  const comment = rows[0]
  return NextResponse.json({
    data: {
      id: comment.id,
      userId: comment.user_id,
      content: comment.content,
      createdAt: comment.created_at instanceof Date ? comment.created_at.toISOString() : String(comment.created_at),
    }
  })
}
