'use client'

import { useState } from 'react'

export default function Home() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header - fixed on scroll */}
      <header className="bg-gray-900 text-white py-4 shadow-md fixed w-full top-0 z-50 transition-all duration-300">
        <div className="max-w-6xl mx-auto px-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold">L-Bracket Generator</h1>
          <nav className="space-x-8">
            <a href="#" className="hover:text-indigo-400">Home</a>
            <a href="#" className="hover:text-indigo-400">Features</a>
            <a href="#" className="hover:text-indigo-400">Contact</a>
          </nav>
        </div>
      </header>

      {/* Spacer */}
      <div className="h-20" />

      {/* Hero Banner */}
      <section className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white py-32 text-center">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-5xl md:text-6xl font-extrabold mb-6 tracking-tight">
            Custom L-Bracket DXF in Seconds
          </h2>
          <p className="text-xl md:text-2xl mb-10 max-w-3xl mx-auto opacity-90">
            Enter dimensions, pay once, download ready-to-cut file instantly.
          </p>
          <div className="inline-block bg-white text-gray-900 px-10 py-6 rounded-xl shadow-2xl text-lg font-semibold">
            Get Started – $3.90
          </div>
        </div>
      </section>

      {/* Test content (remove later) */}
      <main className="flex-grow flex items-center justify-center py-20">
        <div className="text-center">
          <p className="text-3xl mb-6">Count: {count}</p>
          <button
            onClick={() => setCount(c => c + 1)}
            className="bg-indigo-600 text-white px-8 py-4 rounded-lg text-xl hover:bg-indigo-700"
          >
            Increment
          </button>
        </div>
      </main>

      <footer className="bg-gray-900 text-gray-400 py-8 text-center">
        <p>© {new Date().getFullYear()} Kikalo Designs</p>
      </footer>
    </div>
  )
}
