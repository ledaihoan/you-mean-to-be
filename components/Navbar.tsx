'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/blog', label: 'Blog' },
  { href: '/simulations/solar-system', label: 'Simulations' },
]

export function Navbar() {
  const pathname = usePathname()

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link href="/" className="text-lg font-bold text-white tracking-tight">
          YouMeanToBe
        </Link>

        <div className="flex items-center gap-6">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors ${
                pathname === link.href
                  ? 'text-blue-400'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="flex items-center gap-3 ml-4 border-l border-white/10 pl-4">
            <Link
              href="/auth/sign-in"
              className="text-sm text-white/60 hover:text-white transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/auth/sign-up"
              className="text-sm px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-md font-medium transition-colors"
            >
              Get started
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
