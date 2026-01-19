'use client'

import { useState } from 'react'

export default function Home() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-gray-900 text-white py-4">
        <div className="max-w-5xl mx-auto px-6">
          <h1 className="text-2xl font-bold">L-Bracket Generator</h1>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-grow flex items-center justify-center">
        <div className="text-center px-6">
          <h2 className="text-4xl font-bold mb-6 text-gray-800">
            Custom L-Bracket DXF
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-xl mx-auto">
            Enter dimensions • Pay once • Download DXF instantly
          </p>

          <div className="inline-block bg-white p-8 rounded-lg shadow-lg">
            <p className="text-2xl font-semibold mb-4">
              Count: {count}
            </p>
            <button
              onClick={() => setCount(c => c + 1)}
              className="bg-indigo-600 text-white px-6 py-3 rounded hover:bg-indigo-700"
            >
              Increment
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-6 text-center">
        <p>© {new Date().getFullYear()} Sheet Metal Tools</p>
      </footer>
    </div>
  )
}
