import type { Metadata } from 'next'
import './globals.css'
import { Providers } from '@/components/Providers'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'

export const metadata: Metadata = {
  title: 'YouMeanToBe',
  description: 'Universal life-growing platform — simulations, education, community.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-slate-950 text-white min-h-screen flex flex-col">
        <Providers>
          <Navbar />
          <main className="flex-1 pt-14">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  )
}
