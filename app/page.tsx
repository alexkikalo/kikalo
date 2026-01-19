'use client'
import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export default function Home() {
  const [length, setLength] = useState(100)
  const [width, setWidth] = useState(50)
  const [thickness, setThickness] = useState(3)
  const [loading, setLoading] = useState(false)

  const payAndGenerate = async () => {
    const stripe = await stripePromise
    const { error } = await stripe!.redirectToCheckout({
      lineItems: [{ price: 'price_YourRealPriceId', quantity: 1 }],
      mode: 'payment',
      successUrl: `${window.location.origin}/?success=true`,
      cancelUrl: window.location.origin,
    })
    if (error) alert(error.message)
  }

  const generate = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/bracket?length=${length}&width=${width}&thickness=${thickness}`)
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'L-Bracket.dxf'
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      alert('Error generating file')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-gray-900 text-white py-4 shadow-md">
        <div className="max-w-6xl mx-auto px-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold">L-Bracket Generator</h1>
          <nav>
            <ul className="flex space-x-6">
              <li><a href="#" className="hover:text-blue-400">Home</a></li>
              <li><a href="#" className="hover:text-blue-400">About</a></li>
              <li><a href="#" className="hover:text-blue-400">Contact</a></li>
            </ul>
          </nav>
        </div>
      </header>

      {/* Main content - Hero */}
      <main className="flex-grow">
        <section className="bg-indigo-600 text-white py-16 text-center">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Custom L-Bracket DXF in Seconds
            </h2>
            <p className="text-xl mb-10">
              Enter dimensions, pay $3.90 once, and download your ready-to-cut DXF file.
            </p>

            <div className="max-w-md mx-auto bg-white text-gray-800 p-8 rounded-lg shadow-lg">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-1">Length (mm)</label>
                  <input
                    type="number"
                    value={length}
                    onChange={(e) => setLength(Number(e.target.value) || 0)}
                    className="w-full p-3 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Width (mm)</label>
                  <input
                    type="number"
                    value={width}
                    onChange={(e) => setWidth(Number(e.target.value) || 0)}
                    className="w-full p-3 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Thickness (mm)</label>
                  <input
                    type="number"
                    value={thickness}
                    onChange={(e) => setThickness(Number(e.target.value) || 0)}
                    className="w-full p-3 border rounded"
                  />
                </div>
              </div>

              <button
                onClick={payAndGenerate}
                disabled={loading}
                className="mt-8 w-full bg-white text-indigo-600 py-4 rounded font-bold text-lg hover:bg-gray-100 disabled:opacity-50"
              >
                Pay $3.90 & Download DXF
              </button>

              {loading && <p className="mt-4 text-gray-200">Generating...</p>}
            </div>

            <p className="mt-8 text-sm opacity-80">
              Preview: Simple flat plate (bends coming soon)
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-sm">
            &copy; {new Date().getFullYear()} Sheet Metal Tools. All rights reserved.
          </p>
          <p className="mt-2 text-xs">
            Powered by Next.js • Secure payments via Stripe
          </p>
        </div>
