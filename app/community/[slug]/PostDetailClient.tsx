'use client'

import { useState } from 'react'
import Link from 'next/link'
import { authClient } from '@/lib/auth-client'

interface Author {
  id: string
  name: string
  image: string | null
}

interface Comment {
  id: string
  content: string
  created_at: string
  author: Author
}

interface Post {
  id: string
  title: string
  content: string
  slug: string
  tags: string[]
  created_at: string
  author: Author
  reaction_counts: { heart: number; thumbs_up: number; fire: number; rocket: number }
  comment_count: number
  user_reaction: string | null
}

interface Props {
  post: Post
  comments: Comment[]
  userId: string | null
}

const REACTION_EMOJI: Record<string, string> = {
  heart: '❤️',
  thumbs_up: '👍',
  fire: '🔥',
  rocket: '🚀',
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
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

export function PostDetailClient({ post: initialPost, comments: initialComments, userId }: Props) {
  const [post, setPost] = useState(initialPost)
  const [comments, setComments] = useState(initialComments)
  const [newComment, setNewComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [commentError, setCommentError] = useState('')
  const [deleting, setDeleting] = useState(false)

  async function handleReact(type: string) {
    if (!userId) return
    const method = post.user_reaction === type ? 'DELETE' : 'POST'
    const res = await fetch(`/api/community/posts/${post.id}/reactions`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type }),
    })
    if (!res.ok) return
    const { data } = await res.json()
    setPost(p => ({ ...p, reaction_counts: data.counts, user_reaction: data.user_reaction }))
  }

  async function handleAddComment() {
    if (!newComment.trim() || !userId) return
    setSubmitting(true)
    setCommentError('')
    try {
      const res = await fetch(`/api/community/posts/${post.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment.trim() }),
      })
      if (!res.ok) {
        const data = await res.json()
        setCommentError(data.error ?? 'Failed to post comment')
        return
      }
      const { data: comment } = await res.json()
      setComments(prev => [...prev, comment])
      setNewComment('')
      setPost(p => ({ ...p, comment_count: p.comment_count + 1 }))
    } catch {
      setCommentError('Network error — please try again')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete() {
    if (!confirm('Delete this post? This cannot be undone.')) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/community/posts/${post.id}`, { method: 'DELETE' })
      if (res.ok) {
        window.location.href = '/community'
      }
    } finally {
      setDeleting(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900">
      <div className="max-w-2xl mx-auto px-6 pt-20 pb-24">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-white/30 mb-8">
          <Link href="/community" className="hover:text-white/60 transition-colors">Community</Link>
          <span>/</span>
          <span className="text-white/50 truncate max-w-[200px]">{post.title}</span>
        </nav>

        {/* Post */}
        <article className="mb-12">
          {/* Author */}
          <div className="flex items-center gap-3 mb-6">
            {post.author.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={post.author.image} alt={post.author.name} className="w-10 h-10 rounded-full object-cover border-2 border-white/10" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-sm font-bold text-white">
                {post.author.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-white/80">{post.author.name || 'Anonymous'}</p>
              <p className="text-xs text-white/30">{formatDate(post.created_at)}</p>
            </div>
            {userId === post.author.id && (
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="ml-auto text-xs text-white/30 hover:text-red-400 transition-colors"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            )}
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-white mb-6 leading-tight tracking-tight">
            {post.title}
          </h1>

          {/* Content */}
          <div className="prose prose-invert prose-lg max-w-none prose-p:text-white/70 prose-headings:tracking-tight leading-relaxed">
            <p className="whitespace-pre-wrap">{post.content}</p>
          </div>

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-6">
              {post.tags.map(tag => (
                <span key={tag} className="px-3 py-1 text-xs bg-white/5 border border-white/10 rounded-full text-white/40">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </article>

        {/* Reactions */}
        <div className="flex items-center gap-3 mb-12 py-6 border-y border-white/[0.06]">
          {Object.entries(post.reaction_counts).map(([type, count]) => (
            <button
              key={type}
              onClick={() => handleReact(type)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm transition-all ${
                post.user_reaction === type
                  ? 'bg-blue-500/20 border border-blue-500/40 text-blue-400'
                  : 'bg-white/5 border border-white/10 text-white/50 hover:text-white/80 hover:border-white/20'
              }`}
            >
              <span className="text-base">{REACTION_EMOJI[type]}</span>
              <span className="font-medium">{count}</span>
            </button>
          ))}
        </div>

        {/* Comments */}
        <section>
          <h2 className="text-lg font-semibold text-white/80 mb-6">
            Discussion ({post.comment_count})
          </h2>

          {userId ? (
            <div className="mb-8 rounded-xl bg-white/[0.03] border border-white/[0.06] p-4">
              <textarea
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                placeholder="Add to the discussion..."
                rows={3}
                maxLength={1000}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-blue-500/60 resize-none text-sm"
              />
              {commentError && <p className="text-red-400 text-xs mt-1">{commentError}</p>}
              <div className="flex justify-end mt-3">
                <button
                  onClick={handleAddComment}
                  disabled={submitting || !newComment.trim()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-900/40 disabled:text-white/30 text-white text-sm font-semibold rounded-lg transition-colors"
                >
                  {submitting ? 'Posting...' : 'Post Comment'}
                </button>
              </div>
            </div>
          ) : (
            <div className="mb-8 rounded-xl bg-white/[0.03] border border-white/[0.06] p-4 text-center">
              <p className="text-white/40 text-sm">
                <Link href="/auth/sign-in" className="text-blue-400 hover:underline">Sign in</Link> to join the discussion.
              </p>
            </div>
          )}

          {comments.length === 0 ? (
            <p className="text-white/30 text-sm text-center py-8">No comments yet — be the first!</p>
          ) : (
            <div className="space-y-4">
              {comments.map(comment => (
                <div key={comment.id} className="rounded-xl bg-white/[0.02] border border-white/[0.06] p-4">
                  <div className="flex items-center gap-2 mb-3">
                    {comment.author.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={comment.author.image} alt={comment.author.name} className="w-6 h-6 rounded-full object-cover" />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-[10px] font-bold text-white">
                        {comment.author.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <p className="text-sm font-medium text-white/70">{comment.author.name || 'Anonymous'}</p>
                    <p className="text-xs text-white/30 ml-auto">{timeAgo(comment.created_at)}</p>
                  </div>
                  <p className="text-sm text-white/60 leading-relaxed whitespace-pre-wrap">{comment.content}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}