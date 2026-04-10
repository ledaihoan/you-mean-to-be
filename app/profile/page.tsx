export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { getDb } from '@/lib/db'
import { getAllPosts, type Post } from '@/lib/posts'
import { ProfileClient } from './ProfileClient'

async function getProfileData(userId: string) {
  const sql = getDb()

  // Get bio
  const [userRow] = await sql<{ bio: string | null }[]>`
    SELECT COALESCE(bio, '') as bio FROM "user" WHERE id = ${userId}
  `

  // Get saved post slugs
  const savedRows = await sql<{ post_slug: string }[]>`
    SELECT post_slug FROM saved_posts WHERE user_id = ${userId}
  `
  const savedSlugs = savedRows.map(r => r.post_slug)

  // Get joined date
  const [joinedRow] = await sql<{ created_at: Date }[]>`
    SELECT created_at FROM "user" WHERE id = ${userId}
  `

  await sql.end()

  // Hydrate saved posts from MDX
  const allPosts = getAllPosts()
  const savedPosts = savedSlugs
    .map(slug => allPosts.find(p => p.slug === slug))
    .filter((p): p is Post => p !== null)

  return {
    bio: userRow?.bio ?? '',
    joinedAt: joinedRow?.created_at,
    savedPosts,
  }
}

export default async function ProfilePage() {
  const session = await auth.api.getSession()
  if (!session?.user) {
    redirect('/auth/sign-in')
  }

  const { user } = session
  const { bio, joinedAt, savedPosts } = await getProfileData(user.id)

  const initials = user.name
    ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : user.email[0].toUpperCase()

  return (
    <ProfileClient
      user={{
        id: user.id,
        name: user.name ?? '',
        email: user.email,
        image: user.image ?? null,
        bio,
      }}
      joinedAt={joinedAt?.toISOString() ?? null}
      savedPosts={savedPosts}
      initials={initials}
    />
  )
}
