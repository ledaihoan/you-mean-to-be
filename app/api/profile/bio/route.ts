import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getDb } from '@/lib/db'

// PATCH /api/profile/bio — update user bio
export async function PATCH(request: Request) {
  const session = await auth.api.getSession()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { bio } = await request.json()
  if (typeof bio !== 'string') {
    return NextResponse.json({ error: 'bio must be a string' }, { status: 400 })
  }
  if (bio.length > 280) {
    return NextResponse.json({ error: 'bio must be 280 chars or less' }, { status: 400 })
  }

  const sql = getDb()

  // Ensure bio column exists
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

  await sql`UPDATE "user" SET bio = ${bio} WHERE id = ${session.user.id}`
  await sql.end()

  return NextResponse.json({ bio })
}
