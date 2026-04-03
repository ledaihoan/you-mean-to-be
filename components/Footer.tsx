import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t border-white/[0.06] bg-slate-950 mt-auto">
      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row justify-between gap-8">
          <div>
            <p className="text-white font-bold text-lg mb-2">YouMeanToBe</p>
            <p className="text-white/35 text-sm max-w-xs leading-relaxed">
              A universal life-growing platform — immersive simulations, interactive education, and community.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-8 text-sm">
            <div>
              <p className="text-white/50 font-medium mb-3">Collections</p>
              <div className="space-y-2">
                <Link href="/collections/explorers" className="block text-white/30 hover:text-white/70 transition-colors">Explorers (5–8)</Link>
                <Link href="/collections/discoverers" className="block text-white/30 hover:text-white/70 transition-colors">Discoverers (9–12)</Link>
                <Link href="/collections/investigators" className="block text-white/30 hover:text-white/70 transition-colors">Investigators (13–17)</Link>
                <Link href="/collections/deep-divers" className="block text-white/30 hover:text-white/70 transition-colors">Deep Divers (18+)</Link>
              </div>
            </div>
            <div>
              <p className="text-white/50 font-medium mb-3">Explore</p>
              <div className="space-y-2">
                <Link href="/simulations/solar-system" className="block text-white/30 hover:text-white/70 transition-colors">Solar System</Link>
                <Link href="/simulations/galaxy" className="block text-white/30 hover:text-white/70 transition-colors">Galaxy</Link>
                <Link href="/blog" className="block text-white/30 hover:text-white/70 transition-colors">Blog</Link>
              </div>
            </div>
            <div>
              <p className="text-white/50 font-medium mb-3">Account</p>
              <div className="space-y-2">
                <Link href="/auth/sign-in" className="block text-white/30 hover:text-white/70 transition-colors">Sign in</Link>
                <Link href="/auth/sign-up" className="block text-white/30 hover:text-white/70 transition-colors">Sign up</Link>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-white/5 text-center">
          <p className="text-white/20 text-xs">
            &copy; {new Date().getFullYear()} YouMeanToBe. Built with curiosity.
          </p>
        </div>
      </div>
    </footer>
  )
}
