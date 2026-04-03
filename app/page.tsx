import Link from 'next/link'
import { AGE_GROUP_META, getPostsByAgeGroup, getAllPosts } from '@/lib/posts'
import type { AgeGroup } from '@/lib/posts'
import { AgeGroupCard } from '@/components/AgeGroupCard'
import { ArticleCard } from '@/components/ArticleCard'

const features = [
  {
    title: 'Interactive Simulations',
    description: 'Explore the cosmos through real-time 3D simulations. Wander through our solar system, spiral through a galaxy, and watch physics come alive.',
    href: '/simulations/solar-system',
    cta: 'Explore Solar System',
    accent: 'from-blue-500 to-purple-600',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="3" />
        <line x1="12" y1="2" x2="12" y2="4" />
        <line x1="12" y1="20" x2="12" y2="22" />
        <line x1="2" y1="12" x2="4" y2="12" />
        <line x1="20" y1="12" x2="22" y2="12" />
      </svg>
    ),
  },
  {
    title: 'Age-Based Collections',
    description: 'Content organized by growth level — from young explorers to deep divers. Every mind learns differently; find the depth that fits you.',
    href: '/collections',
    cta: 'Browse Collections',
    accent: 'from-emerald-500 to-teal-600',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        <line x1="8" y1="7" x2="16" y2="7" />
        <line x1="8" y1="11" x2="13" y2="11" />
      </svg>
    ),
  },
  {
    title: 'Build Your Profile',
    description: 'Save your favorite posts, track your simulation explorations, and grow alongside a community that values curiosity over engagement metrics.',
    href: '/auth/sign-up',
    cta: 'Join the Community',
    accent: 'from-orange-500 to-red-600',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
]

const ageGroups: AgeGroup[] = ['explorers', 'discoverers', 'investigators', 'deep-divers']

export default function HomePage() {
  const latestPosts = getAllPosts().slice(0, 4)

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950" />
        <div className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: 'radial-gradient(1px 1px at 10% 20%, rgba(255,255,255,0.8) 0%, transparent 100%), radial-gradient(1px 1px at 30% 60%, rgba(255,255,255,0.6) 0%, transparent 100%), radial-gradient(1px 1px at 50% 30%, rgba(255,255,255,0.7) 0%, transparent 100%), radial-gradient(1px 1px at 70% 80%, rgba(255,255,255,0.5) 0%, transparent 100%), radial-gradient(1px 1px at 90% 40%, rgba(255,255,255,0.6) 0%, transparent 100%), radial-gradient(1px 1px at 25% 90%, rgba(255,255,255,0.4) 0%, transparent 100%), radial-gradient(1px 1px at 85% 15%, rgba(255,255,255,0.7) 0%, transparent 100%)',
            backgroundSize: '400px 400px',
          }}
        />

        <div className="relative max-w-4xl mx-auto px-6 pt-24 pb-32 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/50 text-xs mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            17 articles &middot; 7 simulations &middot; 4 age collections
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight tracking-tight">
            What do you<br />
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              mean to be?
            </span>
          </h1>

          <p className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto leading-relaxed mb-10">
            A universal life-growing platform — part interactive simulation, part science museum, part writing platform. Explore the cosmos, learn deeply, and grow without pressure.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/collections"
              className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold text-base transition-colors"
            >
              Browse Collections
            </Link>
            <Link
              href="/simulations/galaxy"
              className="w-full sm:w-auto px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 rounded-lg font-medium text-base transition-colors"
            >
              Explore the Galaxy
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-slate-950 py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">What you&apos;ll find here</h2>
            <p className="text-white/40 max-w-lg mx-auto">
              Three interlocking pillars that reinforce each other — curiosity is the only metric.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {features.map(feature => (
              <Link
                key={feature.title}
                href={feature.href}
                className="group block p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-white/15 transition-all hover:bg-white/[0.05]"
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${feature.accent} flex items-center justify-center mb-4`}>
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-blue-300 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-white/40 text-sm leading-relaxed mb-4">
                  {feature.description}
                </p>
                <span className="text-blue-400 text-sm font-medium group-hover:text-blue-300 transition-colors">
                  {feature.cta} &rarr;
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Collections preview */}
      <section className="bg-slate-950 py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-blue-400 text-sm font-medium tracking-wide uppercase mb-2">
                Grow at your level
              </p>
              <h2 className="text-2xl font-bold text-white">Collections by Age</h2>
            </div>
            <Link href="/collections" className="text-blue-400 text-sm font-medium hover:text-blue-300 transition-colors hidden sm:block">
              View all &rarr;
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {ageGroups.map(group => (
              <AgeGroupCard
                key={group}
                ageGroup={group}
                count={getPostsByAgeGroup(group).length}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Latest articles */}
      <section className="bg-gradient-to-b from-slate-950 to-slate-900 py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-emerald-400 text-sm font-medium tracking-wide uppercase mb-2">
                Fresh reads
              </p>
              <h2 className="text-2xl font-bold text-white">Latest Articles</h2>
            </div>
            <Link href="/blog" className="text-blue-400 text-sm font-medium hover:text-blue-300 transition-colors hidden sm:block">
              View all &rarr;
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 gap-5">
            {latestPosts.map(post => (
              <ArticleCard key={post.slug} post={post} />
            ))}
          </div>
        </div>
      </section>

      {/* Sim preview strip */}
      <section className="bg-slate-900 py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-white mb-2">Live Simulations</h2>
            <p className="text-white/40 text-sm">Real-time WebGL — no plugins needed</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { href: '/simulations/solar-system', title: 'Solar System', sub: '8 planets \u00b7 orbit controls', glow: 'rgba(59,130,246,0.15)', hover: 'blue' },
              { href: '/simulations/galaxy', title: 'Galaxy', sub: 'GLSL shaders \u00b7 bloom', glow: 'rgba(168,85,247,0.2)', hover: 'purple', bg: 'from-indigo-950' },
              { href: '/simulations/physics', title: 'Physics', sub: 'Pendulum \u00b7 Waves \u00b7 Springs', glow: 'rgba(16,185,129,0.15)', hover: 'emerald' },
              { href: '/simulations/mathematics', title: 'Mathematics', sub: 'Fibonacci \u00b7 Fractals \u00b7 Fourier', glow: 'rgba(168,85,247,0.15)', hover: 'purple' },
              { href: '/simulations/nutrition', title: 'Nutrition', sub: 'Macros \u00b7 Meal Builder \u00b7 Energy Pyramid', glow: 'rgba(249,115,22,0.15)', hover: 'orange' },
              { href: '/simulations/earth', title: 'Earth Ecosystem', sub: 'Biomes \u00b7 Food Chain \u00b7 Lotka-Volterra', glow: 'rgba(34,197,94,0.15)', hover: 'emerald' },
            ].map(sim => (
              <Link
                key={sim.href}
                href={sim.href}
                className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${sim.bg ?? 'from-slate-800'} to-slate-900 border border-white/[0.06] hover:border-white/15 transition-all p-6 min-h-[160px] flex flex-col justify-end`}
              >
                <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at center, ${sim.glow}, transparent 70%)` }} />
                <div className="relative">
                  <p className="text-white/40 text-xs mb-1 font-medium uppercase tracking-wider">Simulation</p>
                  <p className={`text-lg font-bold text-white group-hover:text-${sim.hover}-300 transition-colors`}>{sim.title}</p>
                  <p className="text-white/40 text-xs mt-1">{sim.sub}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
