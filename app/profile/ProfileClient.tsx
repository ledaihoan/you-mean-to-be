'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { Post } from '@/lib/posts'
import { ArticleCard } from '@/components/ArticleCard'

interface User {
  id: string
  name: string
  email: string
  image: string | null
  bio: string
}

interface Props {
  user: User
  joinedAt: string | null
  savedPosts: Post[]
  initials: string
}

export function ProfileClient({ user, joinedAt, savedPosts, initials }: Props) {
  const [bio, setBio] = useState(user.bio)
  const [editingBio, setEditingBio] = useState(false)
  const [savingBio, setSavingBio] = useState(false)
  const [bioError, setBioError] = useState('')
  const [bioSuccess, setBioSuccess] = useState(false)

  async function saveBio() {
    if (bio.length > 280) {
      setBioError('Bio must be 280 characters or less')
      return
    }
    setSavingBio(true)
    setBioError('')
    setBioSuccess(false)
    try {
      const res = await fetch('/api/profile/bio', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bio }),
      })
      if (!res.ok) {
        const data = await res.json()
        setBioError(data.error ?? 'Failed to save')
      } else {
        setBioSuccess(true)
        setEditingBio(false)
      }
    } catch {
      setBioError('Network error — please try again')
    } finally {
      setSavingBio(false)
    }
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900">
      <div className="max-w-2xl mx-auto px-6 pt-20 pb-24">
        {/* Avatar + Identity */}
        <div className="flex items-start gap-5 mb-10">
          {user.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.image}
              alt={user.name}
              className="w-20 h-20 rounded-full object-cover border-2 border-white/10"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-2xl font-bold text-white shrink-0">
              {initials}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-white truncate">{user.name || 'Anonymous'}</h1>
            <p className="text-white/40 text-sm mt-0.5">{user.email}</p>
            {joinedAt && (
              <p className="text-white/25 text-xs mt-1">
                Member since {formatDate(joinedAt)}
              </p>
            )}
          </div>
        </div>

        {/* Bio Section */}
        <section className="mb-10">
          <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-3">About</h2>
          <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-5">
            {editingBio ? (
              <div className="space-y-3">
                <textarea
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  maxLength={280}
                  rows={3}
                  placeholder="Tell the community a bit about yourself..."
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-blue-500 resize-none text-sm"
                />
                <div className="flex items-center justify-between">
                  <span className={`text-xs ${bio.length > 250 ? 'text-amber-400' : 'text-white/30'}`}>
                    {bio.length}/280
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setEditingBio(false); setBio(user.bio); setBioError('') }}
                      className="px-3 py-1.5 text-sm text-white/50 hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={saveBio}
                      disabled={savingBio}
                      className="px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white rounded-md font-medium transition-colors"
                    >
                      {savingBio ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                </div>
                {bioError && <p className="text-red-400 text-xs">{bioError}</p>}
                {bioSuccess && <p className="text-emerald-400 text-xs">Bio saved!</p>}
              </div>
            ) : (
              <div className="flex items-start justify-between gap-4">
                <p className={`text-sm leading-relaxed ${user.bio ? 'text-white/60' : 'text-white/30 italic'}`}>
                  {user.bio || 'No bio yet. Click edit to tell us about yourself.'}
                </p>
                <button
                  onClick={() => setEditingBio(true)}
                  className="shrink-0 px-3 py-1 text-xs text-blue-400 hover:text-blue-300 border border-blue-400/30 hover:border-blue-400/60 rounded-md transition-colors"
                >
                  Edit
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Saved Posts Section */}
        <section>
          <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-4">
            Saved Articles
            {savedPosts.length > 0 && (
              <span className="ml-2 text-white/20 font-normal normal-case tracking-normal">
                ({savedPosts.length})
              </span>
            )}
          </h2>

          {savedPosts.length === 0 ? (
            <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-8 text-center">
              <p className="text-white/40 text-sm mb-3">No saved articles yet.</p>
              <p className="text-white/25 text-xs mb-4">
                Tap the bookmark icon on any article to save it here.
              </p>
              <Link
                href="/blog"
                className="inline-block px-4 py-2 text-sm bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors"
              >
                Browse Articles
              </Link>
            </div>
          ) : (
            <div className="grid gap-4">
              {savedPosts.map(post => (
                <ArticleCard key={post.slug} post={post} />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
