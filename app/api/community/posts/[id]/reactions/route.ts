import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getDb } from '@/lib/db'
import { nanoid } from 'nanoid'
import { ensureCommunityTables } from '@/lib/community-tables'

type RouteParams = { params: { id: string } }

const VALID_TYPES = ['heart', 'thumbs_up', 'fire', 'rocket']

// POST /api/community/posts/[id]/reactions — add a reaction
export async function POST(request: Request, { params }: RouteParams) {
  const session = await auth.api.getSession()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const type = typeof body.type === 'string' ? body.type.trim() : ''

  if (!VALID_TYPES.includes(type)) {
    return NextResponse.json(
      { error: `type must be one of: ${VALID_TYPES.join(', ')}` },
      { status: 400 }
    )
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

  // Upsert reaction (ignore if already exists — unique constraint handles it)
  await sql.unsafe(
    'INSERT INTO community_reactions (id, post_id, user_id, type) VALUES ($1, $2, $3, $4) ON CONFLICT (post_id, user_id, type) DO NOTHING',
    [nanoid(), params.id, session.user.id, type]
  )

  await sql.end()
  return NextResponse.json({ data: { type, postId: params.id } })
}

// DELETE /api/community/posts/[id]/reactions — remove own reaction
export async function DELETE(request: Request, { params }: RouteParams) {
  const session = await auth.api.getSession()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const sql = getDb()

  await sql.unsafe(
    'DELETE FROM community_reactions WHERE post_id = $1 AND user_id = $2',
    [params.id, session.user.id]
  )

  await sql.end()
  return NextResponse.json({ data: { deleted: true } })
}
