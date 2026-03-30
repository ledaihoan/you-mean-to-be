import type { Metadata } from 'next'
import dynamic from 'next/dynamic'

const EarthScene = dynamic(
  () => import('@/components/sim/EarthScene'),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
        <p className="text-white/50">Loading Earth ecosystem simulations...</p>
      </div>
    ),
  }
)

export const metadata: Metadata = {
  title: 'Earth Ecosystem — YouMeanToBe',
  description: 'Explore the biome zones that cover Earth, the food chains that sustain ecosystems, and the predator-prey dynamics that keep life in balance — a cosmic accident worth protecting.',
}

export default function EarthPage() {
  return <EarthScene />
}