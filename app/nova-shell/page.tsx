'use client'

import { NovaShellConfigurator } from '@/components/configurator/NovaShellConfigurator'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'NovaShell | Premium Modular Aluminum Enclosures',
  description: 'Precision-engineered modular aluminum enclosures for Raspberry Pi, Jetson, custom electronics, and OEM applications. Preconfigured sizes ready to ship from North Texas. Full custom available.',
}

export default function NovaShellPage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white selection:bg-white selection:text-black">
      {/* Minimal nav for the configurator page */}
      <nav className="border-b border-white/10 bg-zinc-950/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <a href="/" className="flex items-center gap-3">
            <div className="h-7 w-7 rounded bg-white" />
            <div className="font-semibold tracking-tighter">KIKALO</div>
          </a>
          <div className="flex items-center gap-4 text-sm">
            <a href="/" className="text-zinc-400 hover:text-white transition">Back to Kikalo</a>
            <a href="#configurator" className="rounded-full border border-white/20 px-4 py-1 text-xs font-medium tracking-widest transition hover:bg-white hover:text-black">CONFIGURATOR</a>
          </div>
        </div>
      </nav>

      <NovaShellConfigurator />

      <footer className="border-t border-white/10 bg-zinc-950 py-10">
        <div className="mx-auto max-w-4xl px-6 text-center text-xs text-zinc-500">
          Questions about volume pricing, custom finishes, or integration? 
          <a href="mailto:alexkikalo@gmail.com" className="underline underline-offset-2 hover:text-white">Email Alex directly</a>
        </div>
      </footer>
    </main>
  )
}
