'use client'

import { useState, useEffect } from 'react'

interface Props {
  postSlug: string
}

export function BookmarkButton({ postSlug }: Props) {
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState(false)

  useEffect(() => {
    fetch('/api/profile/saved-posts')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data.savedSlugs)) {
          setSaved(data.savedSlugs.includes(postSlug))
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [postSlug])

  async function toggle() {
    if (toggling) return
    setToggling(true)
    // Optimistic update
    setSaved(prev => !prev)
    try {
      const res = await fetch('/api/profile/saved-posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postSlug }),
      })
      if (!res.ok) {
        // Revert on error
        setSaved(prev => !prev)
      }
    } catch {
      setSaved(prev => !prev)
    } finally {
      setToggling(false)
    }
  }

  if (loading) {
    return (
      <div className="w-8 h-8 rounded-full bg-white/5 animate-pulse" />
    )
  }

  return (
    <button
      onClick={toggle}
      disabled={toggling}
      aria-label={saved ? 'Remove bookmark' : 'Save article'}
      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
        saved
          ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30'
          : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/70'
      }`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill={saved ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-4 h-4"
      >
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
      </svg>
    </button>
  )
}
