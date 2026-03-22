'use client'

import { useState } from 'react'
import { createAuthClient } from 'better-auth/react'
import { useRouter } from 'next/navigation'

const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:7139',
})

export default function SignInPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await authClient.signIn.email({
        email,
        password,
      })
      router.push('/')
    } catch {
      setError('Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogle() {
    try {
      await authClient.signIn.social({
        provider: 'google',
        callbackURL: '/',
      })
    } catch {
      setError('Google sign-in failed')
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 flex items-center justify-center">
      <div className="w-full max-w-sm px-4">
        <h1 className="text-3xl font-bold text-white text-center mb-8">Welcome Back</h1>

        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          <div>
            <label htmlFor="email" className="block text-sm text-white/60 mb-1">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-blue-500"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm text-white/60 mb-1">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-blue-500"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded-lg font-medium transition-colors"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-2 bg-transparent text-white/40">or</span>
          </div>
        </div>

        <button
          onClick={handleGoogle}
          className="w-full py-2 px-4 bg-white/10 hover:bg-white/15 border border-white/10 text-white rounded-lg font-medium transition-colors"
        >
          Continue with Google
        </button>

        <p className="text-center text-white/40 text-sm mt-6">
          Don&apos;t have an account?{' '}
          <a href="/auth/sign-up" className="text-blue-400 hover:underline">Sign up</a>
        </p>
      </div>
    </main>
  )
}
