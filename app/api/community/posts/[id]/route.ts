import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getDb } from '@/lib/db'
import { ensureCommunityTables } from '@/lib/community-tables'

type RouteParams = { params: { id: string } }

interface PostRow {
  id: string
  user_id: string
  title: string
  content: string
  slug: string
  tags: string[]
  created_at: Date
  deleted_at: Date | null
  author_name: string | null
  author_avatar: string | null
}

interface DeleteRow {
  id: string
}

// GET /api/community/posts/[id] — get single post
export async function GET(request: Request, { params }: RouteParams) {
  const sql = getDb()
  await ensureCommunityTables(sql)

  const posts = await sql.unsafe<PostRow[]>(
    `SELECT
      p.id, p.user_id, p.title, p.content, p.slug, p.tags, p.created_at,
      p.deleted_at, u.name as author_name, u.image as author_avatar
    FROM community_posts p
    JOIN "user" u ON u.id = p.user_id
    WHERE p.id = $1`,
    [params.id]
  )

  await sql.end()

  if (posts.length === 0 || posts[0].deleted_at !== null) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 })
  }

  const p = posts[0]
  return NextResponse.json({
    data: {
      id: p.id,
      userId: p.user_id,
      title: p.title,
      content: p.content,
      slug: p.slug,
      tags: p.tags,
      createdAt: p.created_at instanceof Date ? p.created_at.toISOString() : String(p.created_at),
      authorName: p.author_name,
      authorAvatar: p.author_avatar,
    }
  })
}

// DELETE /api/community/posts/[id] — delete own post
export async function DELETE(request: Request, { params }: RouteParams) {
  const session = await auth.api.getSession()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const sql = getDb()

  const rows = await sql.unsafe<DeleteRow[]>(
    `UPDATE community_posts
     SET deleted_at = NOW()
     WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL
     RETURNING id`,
    [params.id, session.user.id]
  )

  await sql.end()

  if (rows.length === 0) {
    return NextResponse.json({ error: 'Post not found or not yours' }, { status: 404 })
  }

  return NextResponse.json({ data: { deleted: true } })
}
