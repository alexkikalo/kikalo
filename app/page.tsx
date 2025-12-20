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
    <>
      {/* Header */}
      <header style={{ background: '#111', color: '#fff', padding: '1rem 2rem', textAlign: 'center' }}>
        <h1 style={{ margin: 0 }}>Sheet Metal L-Bracket Generator</h1>
      </header>

      {/* Hero Banner */}
      <section style={{ background: '#635BFF', color: '#fff', padding: '4rem 2rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2.5rem', margin: '0 0 1rem' }}>Custom L-Bracket DXF in Seconds</h2>
        <p style={{ fontSize: '1.2rem', margin: '0 0 2rem' }}>
          Enter dimensions, pay $3.90 once, and download your ready-to-cut DXF file.
        </p>
        <div style={{ maxWidth: '400px', margin: '0 auto' }}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>
              Length (mm):
              <input
                type="number"
                value={length}
                onChange={(e) => setLength(Number(e.target.value) || 0)}
                style={{ width: '100%', padding: '0.5rem' }}
              />
            </label>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>
              Width (mm):
              <input
                type="number"
                value={width}
                onChange={(e) => setWidth(Number(e.target.value) || 0)}
                style={{ width: '100%', padding: '0.5rem' }}
              />
            </label>
            <label style={{ display: 'block', marginBottom: '1rem' }}>
              Thickness (mm):
              <input
                type="number"
                value={thickness}
                onChange={(e) => setThickness(Number(e.target.value) || 0)}
                style={{ width: '100%', padding: '0.5rem' }}
              />
            </label>
          </div>
          <button
            onClick={payAndGenerate}
            disabled={loading}
            style={{
              background: '#fff',
              color: '#635BFF',
              padding: '1rem 2rem',
              border: 'none',
              borderRadius: '4px',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
          >
            Pay $3.90 & Download DXF
          </button>
          {loading && <p style={{ marginTop: '1rem' }}>Generating...</p>}
        </div>
        <p style={{ marginTop: '2rem', fontSize: '0.9rem' }}>
          <small>Preview: Simple flat plate (bends coming soon)</small>
        </p>
      </section>

