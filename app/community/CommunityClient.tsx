'use client'

import { useState } from 'react'
import Link from 'next/link'
import { authClient } from '@/lib/auth-client'

interface ReactionCount {
  heart: number
  thumbs_up: number
  fire: number
  rocket: number
}

interface Author {
  id: string
  name: string
  image: string | null
}

interface Post {
  id: string
  title: string
  content: string
  slug: string
  tags: string[]
  created_at: string
  author: Author
  reaction_counts: ReactionCount
  comment_count: number
  user_reaction: string | null
}

interface Props {
  initialPosts: Post[]
  userId: string | null
}

const REACTION_EMOJI: Record<string, string> = {
  heart: '❤️',
  thumbs_up: '👍',
  fire: '🔥',
  rocket: '🚀',
}

const REACTION_LABEL: Record<string, string> = {
  heart: 'Love',
  thumbs_up: 'Like',
  fire: 'Fire',
  rocket: 'Rockets',
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function CommunityClient({ initialPosts, userId }: Props) {
  const [posts, setPosts] = useState<Post[]>(initialPosts)
  const [showCreate, setShowCreate] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [tags, setTags] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [submitSuccess, setSubmitSuccess] = useState(false)

  async function handleCreatePost() {
    if (!title.trim() || !content.trim()) return
    setSubmitting(true)
    setSubmitError('')
    try {
      const res = await fetch('/api/community/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        setSubmitError(data.error ?? 'Failed to post')
        return
      }
      const { data: newPost } = await res.json()
      setPosts(prev => [newPost, ...prev])
      setShowCreate(false)
      setTitle('')
      setContent('')
      setTags('')
      setSubmitSuccess(true)
      setTimeout(() => setSubmitSuccess(false), 3000)
    } catch {
      setSubmitError('Network error — please try again')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleReact(postId: string, type: string, existing: string | null) {
    if (!userId) return
    const method = existing === type ? 'DELETE' : 'POST'
    const url = `/api/community/posts/${postId}/reactions`
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      })
      if (!res.ok) return
      const { data } = await res.json()
      setPosts(prev => prev.map(p => {
        if (p.id !== postId) return p
        return { ...p, reaction_counts: data.counts, user_reaction: data.user_reaction }
      }))
    } catch { /* silent fail */ }
  }

  return (
    <div className="max-w-3xl mx-auto px-6 pt-20 pb-24">
      {/* Header */}
      <div className="flex items-start justify-between mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Community</h1>
          <p className="text-white/40 leading-relaxed max-w-md">
            Share discoveries, ask questions, and connect with fellow learners.
          </p>
        </div>
        {userId && (
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="shrink-0 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            {showCreate ? 'Cancel' : '+ New Post'}
          </button>
        )}
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="mb-10 rounded-2xl bg-white/[0.03] border border-white/[0.06] p-6">
          <h2 className="text-lg font-semibold text-white mb-5">Start a Discussion</h2>
          <div className="space-y-4">
            <div>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="What's on your mind?"
                maxLength={120}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-blue-500/60 text-lg font-medium"
              />
              <div className={`text-xs mt-1 text-right ${title.length > 100 ? 'text-amber-400' : 'text-white/20'}`}>
                {title.length}/120
              </div>
            </div>
            <div>
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="Share your thoughts, questions, or discoveries..."
                rows={6}
                maxLength={5000}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-blue-500/60 resize-none text-sm leading-relaxed"
              />
              <div className={`text-xs mt-1 text-right ${content.length > 4500 ? 'text-amber-400' : 'text-white/20'}`}>
                {content.length}/5000
              </div>
            </div>
            <div>
              <input
                type="text"
                value={tags}
                onChange={e => setTags(e.target.value)}
                placeholder="Tags — comma separated (e.g. physics, math, question)"
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-blue-500/60 text-sm"
              />
            </div>
            {submitError && <p className="text-red-400 text-sm">{submitError}</p>}
            {submitSuccess && <p className="text-emerald-400 text-sm">Post published!</p>}
            <div className="flex justify-end">
              <button
                onClick={handleCreatePost}
                disabled={submitting || !title.trim() || !content.trim()}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-900/40 disabled:text-white/30 text-white text-sm font-semibold rounded-xl transition-colors"
              >
                {submitting ? 'Publishing...' : 'Publish Post'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Posts */}
      {posts.length === 0 ? (
        <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-12 text-center">
          <p className="text-white/40 text-sm mb-2">No posts yet.</p>
          <p className="text-white/20 text-xs">Be the first to start a discussion!</p>
        </div>
      ) : (
        <div className="space-y-5">
          {posts.map(post => (
            <article key={post.id} className="rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-white/10 transition-all">
              <Link href={`/community/${post.slug}`} className="block p-6">
                <div className="flex items-start gap-3 mb-4">
                  {post.author.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={post.author.image} alt={post.author.name} className="w-8 h-8 rounded-full object-cover border border-white/10" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
                      {post.author.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white/80">{post.author.name || 'Anonymous'}</p>
                    <p className="text-xs text-white/30">{timeAgo(post.created_at)}</p>
                  </div>
                </div>
                <h2 className="text-lg font-semibold text-white mb-2 group-hover:text-blue-300 transition-colors">
                  {post.title}
                </h2>
                <p className="text-sm text-white/50 line-clamp-3 leading-relaxed">{post.content}</p>
                {post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-4">
                    {post.tags.map(tag => (
                      <span key={tag} className="px-2 py-0.5 text-xs bg-white/5 border border-white/10 rounded-full text-white/40">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </Link>
              {/* Reactions + comments */}
              <div className="px-6 pb-5 flex items-center gap-4 border-t border-white/[0.04] pt-4">
                {Object.entries(post.reaction_counts).filter(([, v]) => v > 0).length > 0 ? (
                  <div className="flex items-center gap-3">
                    {Object.entries(post.reaction_counts).filter(([, v]) => v > 0).map(([type, count]) => (
                      <button
                        key={type}
                        onClick={(e) => { e.preventDefault(); handleReact(post.id, type, post.user_reaction) }}
                        className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-colors ${
                          post.user_reaction === type
                            ? 'bg-blue-500/20 text-blue-400'
                            : 'bg-white/5 hover:bg-white/10 text-white/40'
                        }`}
                      >
                        <span>{REACTION_EMOJI[type]}</span>
                        <span className="font-medium">{count}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <span className="text-xs text-white/20">Add a reaction</span>
                )}
                <button className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs text-white/40 hover:text-white/70 transition-colors">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span>{post.comment_count}</span>
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}