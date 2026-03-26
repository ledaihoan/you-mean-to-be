import type { Metadata } from 'next'
import dynamic from 'next/dynamic'

const MathScene = dynamic(
  () => import('@/components/sim/MathScene'),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
        <p className="text-white/50">Loading mathematics simulations...</p>
      </div>
    ),
  }
)

export const metadata: Metadata = {
  title: 'Mathematics — YouMeanToBe',
  description: 'Interactive mathematics simulations exploring the Fibonacci sequence, fractal geometry, and Fourier analysis — mathematics as the invisible architecture of the living world.',
}

export default function MathematicsPage() {
  return <MathScene />
}
