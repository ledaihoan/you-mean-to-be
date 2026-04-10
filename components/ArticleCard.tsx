import Link from 'next/link'
import type { Post } from '@/types/post'
import { CATEGORY_META } from '@/types/post'
import { DifficultyBadge } from './DifficultyBadge'

export function ArticleCard({ post }: { post: Post }) {
  const cat = CATEGORY_META[post.category]

  return (
    <Link href={`/blog/${post.slug}`} className="group block">
      <article className="relative overflow-hidden rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-white/15 transition-all duration-300 hover:bg-white/[0.05]">
        {/* Color accent bar */}
        <div className={`h-1 w-full bg-gradient-to-r ${post.coverColor}`} />

        <div className="p-5 sm:p-6">
          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-md bg-gradient-to-r ${post.coverColor} text-white/90`}>
              {cat.label}
            </span>
            <DifficultyBadge difficulty={post.difficulty} />
            <span className="text-white/30 text-xs ml-auto">
              {post.readingTime} min read
            </span>
          </div>

          {/* Title */}
          <h3 className="text-lg font-semibold text-white group-hover:text-blue-300 transition-colors leading-snug mb-2">
            {post.title}
          </h3>

          {/* Excerpt */}
          {post.excerpt && (
            <p className="text-white/45 text-sm leading-relaxed line-clamp-2">
              {post.excerpt}
            </p>
          )}

          {/* Date */}
          <p className="text-white/25 text-xs mt-3">{post.date}</p>
        </div>
      </article>
    </Link>
  )
}
