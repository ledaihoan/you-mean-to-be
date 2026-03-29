import type { Metadata } from 'next'
import dynamic from 'next/dynamic'

const AtomicScene = dynamic(
  () => import('@/components/sim/AtomicScene'),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
        <p className="text-white/50">Loading atomic simulations...</p>
      </div>
    ),
  }
)

export const metadata: Metadata = {
  title: 'Atomic World — YouMeanToBe',
  description: 'Explore the quantum foundation of the material world — why atoms don\'t collapse, why you feel your skin, and why the four fundamental forces are the reason anything exists.',
}

export default function AtomicPage() {
  return <AtomicScene />
}
