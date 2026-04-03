import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { AGE_GROUP_META, CATEGORY_META, getPostsByAgeGroup } from '@/lib/posts'
import type { AgeGroup, Category } from '@/lib/posts'
import { ArticleCard } from '@/components/ArticleCard'

const validGroups = Object.keys(AGE_GROUP_META) as AgeGroup[]

interface Props {
  params: Promise<{ ageGroup: string }>
  searchParams: Promise<{ category?: string }>
}

export async function generateStaticParams() {
  return validGroups.map(ageGroup => ({ ageGroup }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ageGroup } = await params
  const meta = AGE_GROUP_META[ageGroup as AgeGroup]
  if (!meta) return { title: 'Not Found' }
  return {
    title: `${meta.label} (Ages ${meta.ageRange}) — YouMeanToBe`,
    description: meta.description,
  }
}

export default async function AgeGroupPage({ params, searchParams }: Props) {
  const { ageGroup } = await params
  const { category } = await searchParams

  if (!validGroups.includes(ageGroup as AgeGroup)) notFound()

  const meta = AGE_GROUP_META[ageGroup as AgeGroup]
  let posts = getPostsByAgeGroup(ageGroup as AgeGroup)

  // Get unique categories in this age group for filters
  const categories = [...new Set(posts.map(p => p.category))]

  if (category && Object.keys(CATEGORY_META).includes(category)) {
    posts = posts.filter(p => p.category === category)
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900">
      <div className="max-w-5xl mx-auto px-6 pt-20 pb-24">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-white/30 mb-8">
          <Link href="/collections" className="hover:text-white/60 transition-colors">Collections</Link>
          <span>/</span>
          <span className="text-white/60">{meta.label}</span>
        </nav>

        {/* Hero */}
        <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] mb-10">
          <div className={`absolute inset-0 opacity-[0.1] bg-gradient-to-br ${meta.accent}`} />
          <div className="relative p-8 sm:p-10">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">{meta.icon}</span>
              <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full bg-gradient-to-r ${meta.accent} text-white`}>
                Ages {meta.ageRange}
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{meta.label}</h1>
            <p className="text-white/45 max-w-xl leading-relaxed">{meta.description}</p>
          </div>
        </div>

        {/* Category filter */}
        {categories.length > 1 && (
          <div className="flex flex-wrap items-center gap-2 mb-8">
            <Link
              href={`/collections/${ageGroup}`}
              className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
                !category
                  ? 'bg-white/10 border-white/20 text-white'
                  : 'bg-transparent border-white/[0.06] text-white/40 hover:text-white/70 hover:border-white/15'
              }`}
            >
              All
            </Link>
            {categories.map(cat => {
              const catMeta = CATEGORY_META[cat]
              return (
                <Link
                  key={cat}
                  href={`/collections/${ageGroup}?category=${cat}`}
                  className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
                    category === cat
                      ? 'bg-white/10 border-white/20 text-white'
                      : 'bg-transparent border-white/[0.06] text-white/40 hover:text-white/70 hover:border-white/15'
                  }`}
                >
                  {catMeta.label}
                </Link>
              )
            })}
          </div>
        )}

        {/* Articles grid */}
        {posts.length === 0 ? (
          <p className="text-white/30 text-center py-16">No articles found in this collection yet.</p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-5">
            {posts.map(post => (
              <ArticleCard key={post.slug} post={post} />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
