import type { Metadata } from 'next'
import dynamic from 'next/dynamic'

const PhysicsScene = dynamic(
  () => import('@/components/sim/PhysicsScene'),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
        <p className="text-white/50">Loading physics simulations...</p>
      </div>
    ),
  }
)

export const metadata: Metadata = {
  title: 'Physics — YouMeanToBe',
  description: 'Interactive physics simulations exploring pendulum motion, wave superposition, and harmonic oscillation — physical laws that govern everything alive.',
}

export default function PhysicsPage() {
  return <PhysicsScene />
}
