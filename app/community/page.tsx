import { auth } from '@/lib/auth'
import { getDbFresh } from '@/lib/db'
import { CommunityClient } from './CommunityClient'

export const dynamic = 'force-dynamic'

interface Author {
  id: string
  name: string
  image: string | null
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
  comment_count: bigint | null
  user_reaction: string | null
}

async function getPosts(userId: string | null): Promise<Post[]> {
  const sql = getDbFresh()

  const rows = await sql.unsafe<PostRow[]>(
    `SELECT
      p.id, p.title, p.content, p.slug, p.tags, p.created_at,
      u.id as user_id, u.name as user_name, u.image as user_image,
      hr.cnt as heart_count, ht.cnt as thumbs_count, fr.cnt as fire_count, rr.cnt as rocket_count,
      (SELECT count(*) FROM community_comments WHERE post_id = p.id) as comment_count,
      ur.type as user_reaction
    FROM community_posts p
    JOIN "user" u ON p.user_id = u.id
    LEFT JOIN community_reactions hr ON hr.post_id = p.id AND hr.type = 'heart'
    LEFT JOIN community_reactions ht ON ht.post_id = p.id AND ht.type = 'thumbs_up'
    LEFT JOIN community_reactions fr ON fr.post_id = p.id AND fr.type = 'fire'
    LEFT JOIN community_reactions rr ON rr.post_id = p.id AND rr.type = 'rocket'
    LEFT JOIN community_reactions ur ON ur.post_id = p.id AND ur.user_id = $1
    WHERE p.deleted_at IS NULL
    ORDER BY p.created_at DESC
    LIMIT 20`,
    [userId ?? 'anonymous']
  )
  await sql.end()

  return rows.map(r => ({
    id: r.id,
    title: r.title,
    content: r.content,
    slug: r.slug,
    tags: r.tags ?? [],
    created_at: r.created_at instanceof Date ? r.created_at.toISOString() : String(r.created_at),
    author: { id: r.user_id, name: r.user_name ?? '', image: r.user_image },
    reaction_counts: {
      heart: Number(r.heart_count ?? 0),
      thumbs_up: Number(r.thumbs_count ?? 0),
      fire: Number(r.fire_count ?? 0),
      rocket: Number(r.rocket_count ?? 0),
    },
    comment_count: Number(r.comment_count ?? 0),
    user_reaction: r.user_reaction ?? null,
  }))
}

export const metadata = {
  title: 'Community — YouMeanToBe',
  description: 'Connect with fellow learners, share discoveries, and discuss science.',
  openGraph: {
    title: 'Community — YouMeanToBe',
    description: 'Connect with fellow learners, share discoveries, and discuss science.',
    images: [{ url: '/api/og', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/api/og'],
  },
}

export default async function CommunityPage() {
  const session = await auth.api.getSession()
  const userId = session?.user?.id ?? null
  const posts = await getPosts(userId)

  return <CommunityClient initialPosts={posts} userId={userId} />
}
