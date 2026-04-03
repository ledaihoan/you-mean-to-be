import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const postsDirectory = path.join(process.cwd(), 'content/posts')

/* ── Types ── */

export type AgeGroup = 'explorers' | 'discoverers' | 'investigators' | 'deep-divers'
export type Category = 'physics' | 'mathematics' | 'biology' | 'chemistry' | 'earth-science' | 'nutrition' | 'platform' | 'technology'
export type Difficulty = 'beginner' | 'intermediate' | 'advanced'

export interface Post {
  slug: string
  title: string
  date: string
  excerpt: string
  content: string
  ageGroup: AgeGroup
  category: Category
  difficulty: Difficulty
  readingTime: number
  coverColor: string
}

/* ── Age Group Metadata ── */

export const AGE_GROUP_META: Record<AgeGroup, {
  label: string
  ageRange: string
  description: string
  accent: string
  icon: string
}> = {
  explorers: {
    label: 'Explorers',
    ageRange: '5–8',
    description: 'Big questions, simple language, lots of wonder.',
    accent: 'from-yellow-400 to-orange-500',
    icon: '🔭',
  },
  discoverers: {
    label: 'Discoverers',
    ageRange: '9–12',
    description: 'Deeper explanations with real numbers and experiments.',
    accent: 'from-emerald-400 to-teal-500',
    icon: '🧪',
  },
  investigators: {
    label: 'Investigators',
    ageRange: '13–17',
    description: 'Rigorous science with mathematical foundations.',
    accent: 'from-blue-400 to-indigo-500',
    icon: '🔬',
  },
  'deep-divers': {
    label: 'Deep Divers',
    ageRange: '18+',
    description: 'University-level depth with full derivations.',
    accent: 'from-purple-400 to-pink-500',
    icon: '🌊',
  },
}

/* ── Category Metadata ── */

export const CATEGORY_META: Record<Category, { label: string; color: string }> = {
  physics:        { label: 'Physics',       color: 'from-blue-500 to-cyan-600' },
  mathematics:    { label: 'Mathematics',   color: 'from-purple-500 to-pink-600' },
  biology:        { label: 'Biology',       color: 'from-emerald-500 to-green-600' },
  chemistry:      { label: 'Chemistry',     color: 'from-amber-500 to-orange-600' },
  'earth-science':{ label: 'Earth Science', color: 'from-teal-500 to-emerald-600' },
  nutrition:      { label: 'Nutrition',     color: 'from-orange-500 to-red-500' },
  platform:       { label: 'Platform',      color: 'from-slate-400 to-slate-600' },
  technology:     { label: 'Technology',    color: 'from-indigo-500 to-blue-600' },
}

/* ── Helpers ── */

function computeReadingTime(content: string): number {
  const words = content.trim().split(/\s+/).length
  return Math.max(1, Math.ceil(words / 200))
}

/* ── Core Functions ── */

export function getPostSlugs(): string[] {
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
