import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const postsDirectory = path.join(process.cwd(), 'content/posts')

export interface Post {
  slug: string
  title: string
  date: string
  excerpt: string
  content: string
}

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

  return {
    slug,
    title: data.title ?? 'Untitled',
    date: data.date instanceof Date
      ? data.date.toISOString().slice(0, 10)
      : String(data.date ?? ''),
    excerpt: data.excerpt ?? '',
    content,
  }
}

export function getAllPosts(): Post[] {
  const slugs = getPostSlugs()
  return slugs
    .map(slug => getPostBySlug(slug))
    .filter((p): p is Post => p !== null)
    .sort((a, b) => (a.date > b.date ? -1 : 1))
}
