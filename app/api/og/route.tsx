import { ImageResponse } from 'next/og'
import { getPostBySlug } from '@/lib/posts'
import { CATEGORY_META } from '@/lib/posts'
import type { NextRequest } from 'next/server'

export const dynamic = 'force-static'

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const slug = url.searchParams.get('slug')

  if (!slug) {
    // Default OG image for homepage
    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
            fontSize: 48,
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 16,
            }}
          >
            <div
              style={{
                fontSize: 72,
                fontWeight: 700,
                color: 'white',
                letterSpacing: '-0.02em',
              }}
            >
              YouMeanToBe
            </div>
            <div
              style={{
                fontSize: 28,
                color: 'rgba(255,255,255,0.5)',
                fontWeight: 400,
                maxWidth: 600,
                textAlign: 'center',
                lineHeight: 1.4,
              }}
            >
              Interactive science simulations, deep-dive articles, and a community of curious minds
            </div>
            <div
              style={{
                marginTop: 24,
                display: 'flex',
                gap: 12,
              }}
            >
              {['🌌', '⚛️', '🧬', '🧠', '🌍', '🔬', '📐', '💪'].map((emoji, i) => (
                <span key={i} style={{ fontSize: 36 }}>{emoji}</span>
              ))}
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    )
  }

  const post = getPostBySlug(slug)
  if (!post) {
    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          <div style={{ fontSize: 48, color: 'white' }}>YouMeanToBe</div>
        </div>
      ),
      { width: 1200, height: 630 }
    )
  }

  const catMeta = CATEGORY_META[post.category]
  const gradient = post.coverColor.replace('from-', '').replace(' to-', ', ')
  const [from, to] = gradient.split(', ')

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* Color accent bar */}
        <div
          style={{
            height: 12,
            background: `linear-gradient(90deg, #${from || '3b82f6'} 0%, #${to || '8b5cf6'} 100%)`,
          }}
        />

        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            padding: '60px 72px',
            justifyContent: 'space-between',
          }}
        >
          {/* Category + reading time */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
            }}
          >
            <span
              style={{
                padding: '6px 16px',
                borderRadius: 9999,
                fontSize: 18,
                fontWeight: 600,
                color: catMeta?.color === 'from-emerald-500 to-teal-600' ? '#34d399'
                  : catMeta?.color === 'from-amber-500 to-orange-600' ? '#fbbf24'
                  : catMeta?.color === 'from-rose-500 to-pink-600' ? '#fb7185'
                  : catMeta?.color === 'from-blue-500 to-indigo-600' ? '#60a5fa'
                  : catMeta?.color === 'from-violet-500 to-purple-600' ? '#a78bfa'
                  : '#94a3b8',
                backgroundColor: 'rgba(255,255,255,0.1)',
              }}
            >
              {catMeta?.label ?? 'Article'}
            </span>
            <span style={{ fontSize: 20, color: 'rgba(255,255,255,0.4)' }}>
              {post.readingTime} min read
            </span>
          </div>

          {/* Title */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
          >
            <div
              style={{
                fontSize: 56,
                fontWeight: 700,
                color: 'white',
                lineHeight: 1.2,
                letterSpacing: '-0.02em',
                maxWidth: 900,
              }}
            >
              {post.title}
            </div>
            {post.excerpt && (
              <div
                style={{
                  fontSize: 22,
                  color: 'rgba(255,255,255,0.55)',
                  lineHeight: 1.5,
                  maxWidth: 850,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {post.excerpt}
              </div>
            )}
          </div>

          {/* Footer */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 8,
                  background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 24,
                }}
              >
                🌱
              </div>
              <div>
                <div style={{ fontSize: 22, fontWeight: 600, color: 'white' }}>YouMeanToBe</div>
                <div style={{ fontSize: 16, color: 'rgba(255,255,255,0.4)' }}>youmeantobe.com</div>
              </div>
            </div>
            <span
              style={{
                fontSize: 16,
                color: 'rgba(255,255,255,0.3)',
              }}
            >
              {post.ageGroup === 'explorers' ? '🧒 Explorers' : post.ageGroup === 'discoverers' ? '🔍 Discoverers' : post.ageGroup === 'investigators' ? '🔬 Investigators' : '🌟 Deep Divers'}
            </span>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}