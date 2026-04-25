import { nanoid } from 'nanoid'
import { getDb } from '@/lib/db'

/**
 * Convert a title string to a kebab-case slug.
 */
export function toKebabCase(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-')
}

/**
 * Generate a unique slug from a title:
 * - Convert to kebab-case
 * - Append first 6 chars of nanoid
 * - Ensure uniqueness by appending more chars if needed
 */
export async function generateSlug(title: string): Promise<string> {
  const baseSlug = toKebabCase(title)
  let slug = `${baseSlug}-${nanoid().slice(0, 6)}`

  const sql = getDb()
  try {
    for (let attempt = 0; attempt < 10; attempt++) {
      const existing = await sql.unsafe<{ id: string }[]>(
        'SELECT id FROM community_posts WHERE slug = $1',
        [slug]
      )
      if (existing.length === 0) {
        return slug
      }
      // Append one more char from nanoid
      slug = `${baseSlug}-${nanoid().slice(0, 7 + attempt)}`
    }
    // Fallback: full nanoid
    return `${baseSlug}-${nanoid()}`
  } finally {
    await sql.end()
  }
}
