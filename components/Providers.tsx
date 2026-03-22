'use client'

// better-auth v1 uses createAuthClient without a provider wrapper.
// The client is instantiated directly in components that need auth.

export function Providers({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
