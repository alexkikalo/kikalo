'use client'

import { useState } from 'react'

export default function Home() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-gray-900 text-white py-5 fixed w-full top-0 z-50 shadow-lg">
        <div className="max-w-6xl mx-auto px-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold">L-Bracket Generator</h1>
          <nav className="space-x-8 text-lg">
            <a href="#" className="hover:text-indigo-400">Home</a>
            <a href="#" className="hover:text-indigo-400">Features</a>
            <a href="#" className="hover:text-indigo-400">Contact</a>
          </nav>
        </div>
      </header>

      {/* Spacer */}
      <div className="h-24" />

      {/* Hero */}
      <section className="bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 text-white">
        <div className="max-w-5xl mx-auto px-6 py-32 text-center">
          <h2 className="text-5xl md:text-6xl font-extrabold mb-6 tracking-tight">
            Custom L-Bracket DXF<br />in Seconds
          </h2>

          <p className="text-xl md:text-2xl mb-10 max-w-3xl mx-auto opacity-90">
            Enter dimensions, pay once,<br />
            download ready-to-cut file instantly.
          </p>

          <div className="inline-block bg-white text-indigo-700 px-12 py-6 rounded-xl text-xl font-bold shadow-2xl hover:bg-gray-100 transition">
            Get Started – $3.90
          </div>
        </div>
      </section>

      {/* Remove this part later */}
      <div className="py-20 text-center">
        <p className="text-3xl mb-6">Count: {count}</p>
        <button
          onClick={() => setCount(c => c + 1)}
          className="bg-indigo-600 text-white px-10 py-5 rounded-xl text-xl"
        >
          Increment
        </button>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 text-center mt-auto">
        <p>© {new Date().getFullYear()} Kikalo Designs</p>
      </footer>
    </div>
  )
}
