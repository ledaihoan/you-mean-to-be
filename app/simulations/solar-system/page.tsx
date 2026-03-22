import type { Metadata } from 'next'
import dynamic from 'next/dynamic'

const SolarSystemScene = dynamic(
  () => import('@/components/sim/SolarSystemScene'),
  { ssr: false, loading: () => (
    <div className="flex items-center justify-center w-full" style={{ height: '80vh' }}>
      <p className="text-white/50">Loading simulation...</p>
    </div>
  )}
)

export const metadata: Metadata = {
  title: 'Solar System — YouMeanToBe',
  description: 'Interactive solar system simulation. Explore the planets of our solar system.',
}

export default function SolarSystemPage() {
  return (
    <main className="min-h-screen bg-[#050510]">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-2 text-center">Solar System</h1>
        <p className="text-white/60 text-center mb-6">Explore our cosmic neighborhood</p>
        <SolarSystemScene />
      </div>
    </main>
  )
}
