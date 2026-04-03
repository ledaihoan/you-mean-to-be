import { AGE_GROUP_META, getPostsByAgeGroup } from '@/lib/posts'
import type { AgeGroup } from '@/lib/posts'
import { AgeGroupCard } from '@/components/AgeGroupCard'

export const metadata = {
  title: 'Collections — YouMeanToBe',
  description: 'Browse educational articles organized by age group — from young explorers to deep divers.',
}

const ageGroups: AgeGroup[] = ['explorers', 'discoverers', 'investigators', 'deep-divers']

export default function CollectionsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900">
      <div className="max-w-5xl mx-auto px-6 pt-20 pb-24">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-blue-400 text-sm font-medium tracking-wide uppercase mb-3">
            Learn at your level
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
            Collections
          </h1>
          <p className="text-white/40 max-w-lg mx-auto leading-relaxed">
            Every mind grows differently. Pick the depth that fits you — from wonder-filled explorations to university-level deep dives.
          </p>
        </div>

        {/* Age group grid */}
        <div className="grid sm:grid-cols-2 gap-5">
          {ageGroups.map(group => (
            <AgeGroupCard
              key={group}
              ageGroup={group}
              count={getPostsByAgeGroup(group).length}
            />
          ))}
        </div>
      </div>
    </main>
  )
}
