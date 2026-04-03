import type { Metadata } from 'next'
import dynamic from 'next/dynamic'

const BrainScene = dynamic(
  () => import('@/components/sim/BrainScene'),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
        <p className="text-white/50">Loading brain simulations...</p>
      </div>
    ),
  }
)

export const metadata: Metadata = {
  title: 'Brain & Consciousness — YouMeanToBe',
  description: 'Interactive simulations exploring the brain as a prediction machine — how it constructs the self, perceives time, and generates consciousness.',
}

export default function BrainPage() {
  return <BrainScene />
}
