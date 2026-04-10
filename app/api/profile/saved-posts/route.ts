import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getDb } from '@/lib/db'
import { nanoid } from 'nanoid'

async function ensureTables(sql: ReturnType<typeof getDb>) {
  await sql.unsafe(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'user' AND column_name = 'bio'
      ) THEN
        ALTER TABLE "user" ADD COLUMN bio TEXT DEFAULT '';
      END IF;
    END $$;
  `)
  await sql.unsafe(`
    CREATE TABLE IF NOT EXISTS saved_posts (
      id TEXT PRIMARY KEY DEFAULT nanoid(),
      user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
      post_slug TEXT NOT NULL,
      saved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(user_id, post_slug)
    );
  `)
}

// GET /api/profile/saved-posts — get current user's saved post slugs
export async function GET() {
  const session = await auth.api.getSession()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const sql = getDb()
  await ensureTables(sql)

  const rows = await sql<{ post_slug: string }[]>`
    SELECT post_slug FROM saved_posts WHERE user_id = ${session.user.id}
  `

  await sql.end()
  return NextResponse.json({ savedSlugs: rows.map(r => r.post_slug) })
}

// POST /api/profile/saved-posts — toggle save a post
export async function POST(request: Request) {
  const session = await auth.api.getSession()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { postSlug } = await request.json()
  if (!postSlug) {
    return NextResponse.json({ error: 'postSlug required' }, { status: 400 })
  }

  const sql = getDb()
  await ensureTables(sql)

  // Check if already saved
  const existing = await sql<{ id: string }[]>`
    SELECT id FROM saved_posts WHERE user_id = ${session.user.id} AND post_slug = ${postSlug}
  `

  if (existing.length > 0) {
    // Unsave
    await sql`DELETE FROM saved_posts WHERE user_id = ${session.user.id} AND post_slug = ${postSlug}`
    await sql.end()
    return NextResponse.json({ saved: false })
  } else {
    // Save
    await sql`INSERT INTO saved_posts (id, user_id, post_slug) VALUES (${nanoid()}, ${session.user.id}, ${postSlug})`
    await sql.end()
    return NextResponse.json({ saved: true })
  }
}
