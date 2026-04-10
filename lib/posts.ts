import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import type { AgeGroup, Category, Difficulty, Post } from '@/types/post'
import { AGE_GROUP_META, CATEGORY_META } from '@/types/post'

export type { AgeGroup, Category, Difficulty, Post }
export { AGE_GROUP_META, CATEGORY_META }

const postsDirectory = path.join(process.cwd(), 'content/posts')

/* ── Helpers ── */

function computeReadingTime(content: string): number {
  const words = content.trim().split(/\s+/).length
  return Math.max(1, Math.ceil(words / 200))
}

/* ── Core Functions ── */

export function getPostSlugs(): Array<string> {
  if (!fs.existsSync(postsDirectory)) return []
  return fs
    .readdirSync(postsDirectory)
    .filter(f => f.endsWith('.mdx'))
    .map(f => f.replace(/\.mdx$/, ''))
}

export function getPostBySlug(slug: string): Post | null {
  const fullPath = path.join(postsDirectory, `${slug}.mdx`)
  if (!fs.existsSync(fullPath)) return null

  const fileContents = fs.readFileSync(fullPath, 'utf8')
  const { data, content } = matter(fileContents)

  const ageGroup = (data.ageGroup as AgeGroup) ?? 'discoverers'
  const category = (data.category as Category) ?? 'platform'
  const difficulty = (data.difficulty as Difficulty) ?? 'beginner'

  return {
    slug,
    title: data.title ?? 'Untitled',
    date: data.date instanceof Date
      ? data.date.toISOString().slice(0, 10)
      : String(data.date ?? ''),
    excerpt: data.excerpt ?? '',
    content,
    ageGroup,
    category,
    difficulty,
    readingTime: data.readingTime ?? computeReadingTime(content),
    coverColor: data.coverColor ?? CATEGORY_META[category]?.color ?? 'from-slate-500 to-slate-600',
  }
}

export function getAllPosts(): Post[] {
  const slugs = getPostSlugs()
  return slugs
    .map(slug => getPostBySlug(slug))
    .filter((p): p is Post => p !== null)
    .sort((a, b) => (a.date > b.date ? -1 : 1))
}

/* ── Query Functions ── */

export function getPostsByAgeGroup(ageGroup: AgeGroup): Post[] {
  return getAllPosts().filter(p => p.ageGroup === ageGroup)
}

export function getPostsByCategory(category: Category): Post[] {
  return getAllPosts().filter(p => p.category === category)
}

export function getAllCategories(): Category[] {
  const posts = getAllPosts()
  return [...new Set(posts.map(p => p.category))]
}
