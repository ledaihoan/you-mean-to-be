import Link from 'next/link'
import type { AgeGroup } from '@/lib/posts'
import { AGE_GROUP_META } from '@/lib/posts'

interface Props {
  ageGroup: AgeGroup
  count: number
}

export function AgeGroupCard({ ageGroup, count }: Props) {
  const meta = AGE_GROUP_META[ageGroup]

  return (
    <Link
      href={`/collections/${ageGroup}`}
      className="group relative block overflow-hidden rounded-2xl border border-white/[0.06] hover:border-white/15 transition-all duration-300 bg-white/[0.02] hover:bg-white/[0.05]"
    >
      {/* Gradient glow background */}
      <div className={`absolute inset-0 opacity-[0.08] group-hover:opacity-[0.14] transition-opacity bg-gradient-to-br ${meta.accent}`} />

      <div className="relative p-6 sm:p-8">
        {/* Icon + Age badge */}
        <div className="flex items-start justify-between mb-4">
          <span className="text-3xl">{meta.icon}</span>
          <span className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full bg-gradient-to-r ${meta.accent} text-white`}>
            Ages {meta.ageRange}
          </span>
        </div>

        {/* Label */}
        <h3 className="text-xl font-bold text-white group-hover:text-blue-200 transition-colors mb-2">
          {meta.label}
        </h3>

        {/* Description */}
        <p className="text-white/40 text-sm leading-relaxed mb-4">
          {meta.description}
        </p>

        {/* Count + CTA */}
        <div className="flex items-center justify-between">
          <span className="text-white/30 text-xs font-medium">
            {count} {count === 1 ? 'article' : 'articles'}
          </span>
          <span className="text-blue-400 text-sm font-medium group-hover:text-blue-300 transition-colors">
            Explore &rarr;
          </span>
        </div>
      </div>
    </Link>
  )
}
