import postgres from 'postgres'

type SqlInstance = ReturnType<typeof postgres>

/**
 * Ensure all community tables exist. Call once per request chain.
 */
export async function ensureCommunityTables(sql: SqlInstance) {
  await sql.unsafe(`
    CREATE TABLE IF NOT EXISTS community_posts (
      id TEXT PRIMARY KEY DEFAULT nanoid(),
      user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      tags TEXT[] DEFAULT '{}',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      deleted_at TIMESTAMPTZ DEFAULT NULL
    );
  `)
  await sql.unsafe(`
    CREATE TABLE IF NOT EXISTS community_comments (
      id TEXT PRIMARY KEY DEFAULT nanoid(),
      post_id TEXT NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
      content TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `)
  await sql.unsafe(`
    CREATE TABLE IF NOT EXISTS community_reactions (
      id TEXT PRIMARY KEY DEFAULT nanoid(),
      post_id TEXT NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
      type TEXT NOT NULL CHECK (type IN ('heart', 'thumbs_up', 'fire', 'rocket')),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(post_id, user_id, type)
    );
  `)
}
