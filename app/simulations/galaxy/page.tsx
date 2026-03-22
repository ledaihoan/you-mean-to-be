import type { Metadata } from 'next'
import dynamic from 'next/dynamic'

const GalaxyScene = dynamic(
  () => import('@/components/sim/GalaxyScene'),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center w-full" style={{ height: '80vh' }}>
        <p className="text-white/50">Rendering galaxy...</p>
      </div>
    ),
  }
)

export const metadata: Metadata = {
  title: 'Galaxy — YouMeanToBe',
  description: 'Procedural spiral galaxy with custom GLSL shaders and real-time bloom.',
}

export default function GalaxyPage() {
  return (
    <main className="min-h-screen bg-[#020208]">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-2 text-center">Galaxy</h1>
        <p className="text-white/60 text-center mb-6">
          Procedural spiral galaxy — custom GLSL shaders, bloom post-processing
        </p>
        <GalaxyScene />
      </div>
    </main>
  )
}
