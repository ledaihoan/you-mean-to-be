import type { Metadata } from 'next'
import dynamic from 'next/dynamic'

const NutritionScene = dynamic(
  () => import('@/components/sim/NutritionScene'),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
        <p className="text-white/50">Loading nutrition simulations...</p>
      </div>
    ),
  }
)

export const metadata: Metadata = {
  title: 'Nutrition — YouMeanToBe',
  description: 'Interactive nutrition simulations exploring metabolism, macro calculators, and the energy flows that power every living cell.',
}

export default function NutritionPage() {
  return <NutritionScene />
}
