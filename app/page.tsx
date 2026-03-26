import Link from 'next/link'

const features = [
  {
    title: 'Interactive Simulations',
    description: 'Explore the cosmos through real-time 3D simulations. Wander through our solar system, spiral through a galaxy, and watch physics come alive.',
    href: '/simulations/solar-system',
    cta: 'Explore Solar System',
    accent: 'from-blue-500 to-purple-600',
  },
  {
    title: 'Deep-Dive Blog',
    description: 'Tutorials, science explainers, and reflections — each post can embed live interactive simulations inline. Learning that pulls you in.',
    href: '/blog',
    cta: 'Read the Blog',
    accent: 'from-emerald-500 to-teal-600',
  },
  {
    title: 'Build Your Profile',
    description: 'Save your favorite posts, track your simulation explorations, and grow alongside a community that values curiosity over engagement metrics.',
    href: '/auth/sign-up',
    cta: 'Join the Community',
    accent: 'from-orange-500 to-red-600',
  },
]

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950" />
        {/* Star field effect */}
        <div className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: 'radial-gradient(1px 1px at 10% 20%, rgba(255,255,255,0.8) 0%, transparent 100%), radial-gradient(1px 1px at 30% 60%, rgba(255,255,255,0.6) 0%, transparent 100%), radial-gradient(1px 1px at 50% 30%, rgba(255,255,255,0.7) 0%, transparent 100%), radial-gradient(1px 1px at 70% 80%, rgba(255,255,255,0.5) 0%, transparent 100%), radial-gradient(1px 1px at 90% 40%, rgba(255,255,255,0.6) 0%, transparent 100%), radial-gradient(1px 1px at 25% 90%, rgba(255,255,255,0.4) 0%, transparent 100%), radial-gradient(1px 1px at 85% 15%, rgba(255,255,255,0.7) 0%, transparent 100%)',
            backgroundSize: '400px 400px',
          }}
        />

        <div className="relative max-w-4xl mx-auto px-6 pt-24 pb-32 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/50 text-xs mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Now live — Phase 1 foundation complete
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
              href="/simulations/galaxy"
              className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold text-base transition-colors"
            >
              Explore the Galaxy
            </Link>
            <Link
              href="/blog"
              className="w-full sm:w-auto px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 rounded-lg font-medium text-base transition-colors"
            >
              Read the Blog
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
                className="group block p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all hover:bg-white/[0.07]"
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${feature.accent} flex items-center justify-center mb-4`}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                    {feature.title === 'Interactive Simulations' && (
                      <>
                        <circle cx="12" cy="12" r="10" />
                        <circle cx="12" cy="12" r="3" />
                        <line x1="12" y1="2" x2="12" y2="4" />
                        <line x1="12" y1="20" x2="12" y2="22" />
                        <line x1="2" y1="12" x2="4" y2="12" />
                        <line x1="20" y1="12" x2="22" y2="12" />
                      </>
                    )}
                    {feature.title === 'Deep-Dive Blog' && (
                      <>
                        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                        <polyline points="14,2 14,8 20,8" />
                        <line x1="16" y1="13" x2="8" y2="13" />
                        <line x1="16" y1="17" x2="8" y2="17" />
                        <line x1="10" y1="9" x2="8" y2="9" />
                      </>
                    )}
                    {feature.title === 'Build Your Profile' && (
                      <>
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </>
                    )}
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-blue-300 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-white/40 text-sm leading-relaxed mb-4">
                  {feature.description}
                </p>
                <span className="text-blue-400 text-sm font-medium group-hover:text-blue-300 transition-colors">
                  {feature.cta} →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Sim preview strip */}
      <section className="bg-gradient-to-b from-slate-950 to-slate-900 py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-white mb-2">Live Simulations</h2>
            <p className="text-white/40 text-sm">Real-time WebGL — no plugins needed</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <Link
              href="/simulations/solar-system"
              className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 hover:border-white/20 transition-all p-6 min-h-[160px] flex flex-col justify-end"
            >
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.15),transparent_70%)]" />
              <div className="relative">
                <p className="text-white/40 text-xs mb-1 font-medium uppercase tracking-wider">Simulation</p>
                <p className="text-lg font-bold text-white group-hover:text-blue-300 transition-colors">Solar System</p>
                <p className="text-white/40 text-xs mt-1">8 planets · orbit controls</p>
              </div>
            </Link>
            <Link
              href="/simulations/galaxy"
              className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-950 to-slate-900 border border-white/10 hover:border-white/20 transition-all p-6 min-h-[160px] flex flex-col justify-end"
            >
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(168,85,247,0.2),transparent_70%)]" />
              <div className="relative">
                <p className="text-white/40 text-xs mb-1 font-medium uppercase tracking-wider">Simulation</p>
                <p className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors">Galaxy</p>
                <p className="text-white/40 text-xs mt-1">GLSL shaders · bloom</p>
              </div>
            </Link>
            <Link
              href="/simulations/physics"
              className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 hover:border-white/20 transition-all p-6 min-h-[160px] flex flex-col justify-end"
            >
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.15),transparent_70%)]" />
              <div className="relative">
                <p className="text-white/40 text-xs mb-1 font-medium uppercase tracking-wider">Simulation</p>
                <p className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors">Physics</p>
                <p className="text-white/40 text-xs mt-1">Pendulum · Waves · Springs</p>
              </div>
            </Link>
            <Link
              href="/simulations/mathematics"
              className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 hover:border-white/20 transition-all p-6 min-h-[160px] flex flex-col justify-end"
            >
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(168,85,247,0.15),transparent_70%)]" />
              <div className="relative">
                <p className="text-white/40 text-xs mb-1 font-medium uppercase tracking-wider">Simulation</p>
                <p className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors">Mathematics</p>
                <p className="text-white/40 text-xs mt-1">Fibonacci · Fractals · Fourier</p>
              </div>
            </Link>
            <Link
              href="/simulations/nutrition"
              className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 hover:border-white/20 transition-all p-6 min-h-[160px] flex flex-col justify-end"
            >
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(249,115,22,0.15),transparent_70%)]" />
              <div className="relative">
                <p className="text-white/40 text-xs mb-1 font-medium uppercase tracking-wider">Simulation</p>
                <p className="text-lg font-bold text-white group-hover:text-orange-300 transition-colors">Nutrition</p>
                <p className="text-white/40 text-xs mt-1">Macros · Meal Builder · Energy Pyramid</p>
              </div>
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
