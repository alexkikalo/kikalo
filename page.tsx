'use client'
import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'

const stripePromise = loadStripe(pk_live_51PqnnaLBTzItuMFqk9L8S9VC4ik2CAGTDPgRlbeJORudC6AsE0XaV2jfFJ1J65ruJpEjp0JNvtkqIrP9cwCLuwnj00NwqWUCzL) // Replace with real key from Stripe dashboard

export default function Home() {
  const [length, setLength] = useState(100)
  const [width, setWidth] = useState(50)
  const [thickness, setThickness] = useState(3)
  const [loading, setLoading] = useState(false)

  const generate = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/bracket?length=${length}&width=${width}&thickness=${thickness}`)
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'L-Bracket.dxf'
      a.click()
    } catch (e) {
      alert('Error generating file')
    }
    setLoading(false)
  }

  const payAndGenerate = async () => {
    const stripe = await stripePromise
    const { error } = await stripe.redirectToCheckout({
      lineItems: [{ price: 'price_12345', quantity: 1 }], // Create this price in Stripe dashboard ($3.90)
      mode: 'payment',
      successUrl: `${window.location.origin}/?success=true`,
      cancelUrl: window.location.origin,
    })
    if (error) alert(error.message)
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: 'auto' }}>
      <h1>Sheet Metal L-Bracket Generator</h1>
      <p>Customize & download DXF for laser cutting ($3.90)</p>
      
      <div style={{ margin: '1rem 0' }}>
        <label>Length (mm): <input type="number" value={length} onChange={e => setLength(e.target.value)} /></label><br/>
        <label>Width (mm): <input type="number" value={width} onChange={e => setWidth(e.target.value)} /></label><br/>
        <label>Thickness (mm): <input type="number" value={thickness} onChange={e => setThickness(e.target.value)} /></label>
      </div>

      <button onClick={payAndGenerate} style={{ background: '#635BFF', color: 'white', padding: '1rem', border: 'none' }}>
        Pay $3.90 & Download DXF
      </button>
      {loading && <p>Generating...</p>}
      
      <p><small>Preview: Simple flat plate (add bends soon)</small></p>
    </div>
  )
}
