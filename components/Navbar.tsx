'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createAuthClient } from 'better-auth/react'

const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:7139',
})

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/collections', label: 'Collections' },
  { href: '/blog', label: 'Blog' },
  { href: '/simulations/solar-system', label: 'Simulations' },
]

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
}

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [session, setSession] = useState<{ user: { name: string; image: string | null; email: string } } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    authClient.getSession().then(({ data }) => {
      if (!data?.user) {
        setSession(null)
      } else {
        setSession({ user: data.user as { name: string; image: string | null; email: string } })
      }
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  function isActive(href: string) {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  async function handleSignOut() {
    await authClient.signOut()
    router.push('/')
    setSession(null)
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.06] bg-slate-950/80 backdrop-blur-xl">
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
                isActive(link.href)
                  ? 'text-blue-400'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="flex items-center gap-3 ml-4 border-l border-white/[0.06] pl-4">
            {loading ? (
              <div className="w-8 h-8 rounded-full bg-white/5 animate-pulse" />
            ) : session?.user ? (
              <>
                <Link
                  href="/profile"
                  className={`text-sm font-medium transition-colors ${
                    isActive('/profile')
                      ? 'text-blue-400'
                      : 'text-white/50 hover:text-white'
                  }`}
                >
                  Profile
                </Link>
                {session.user.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={session.user.image}
                    alt={session.user.name}
                    className="w-7 h-7 rounded-full object-cover border border-white/10"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white">
                    {getInitials(session.user.name || session.user.email)}
                  </div>
                )}
                <button
                  onClick={handleSignOut}
                  className="text-sm text-white/30 hover:text-white/60 transition-colors ml-1"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/sign-in"
                  className="text-sm text-white/50 hover:text-white transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  href="/auth/sign-up"
                  className="text-sm px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-md font-medium transition-colors"
                >
                  Get started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
