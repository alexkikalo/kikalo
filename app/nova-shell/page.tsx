'use client';

import type { Metadata } from 'next';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { NovaShellClientWrapper } from '@/components/configurator/NovaShellClientWrapper';

export const metadata: Metadata = {
  title: 'NovaShell | Premium Modular Aluminum Enclosures',
  description: 'Precision-engineered modular aluminum enclosures for Raspberry Pi, Jetson, custom electronics, and OEM applications. Preconfigured sizes ready to ship from North Texas. Full custom available.',
};

export default function NovaShellPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <main className="min-h-screen bg-zinc-950 text-white selection:bg-white selection:text-black">
      {/* Minimal nav for the configurator page */}
      <nav className="border-b border-white/10 bg-zinc-950/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <a href="/" className="flex items-center gap-3">
            <img 
              src="/images/Color.png" 
              alt="Kikalo Logo" 
              className="h-8 w-auto" 
            />
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4 text-sm">
            <a href="/" className="text-zinc-400 hover:text-white transition">Back to Kikalo</a>
            <a href="#configurator" className="rounded-full border border-white/20 px-4 py-1 text-xs font-medium tracking-widest transition hover:bg-white hover:text-black">CONFIGURATOR</a>
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-white"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-white/10 bg-zinc-950/95 px-6 py-4">
            <div className="flex flex-col gap-4 text-sm">
              <a href="/" onClick={closeMobileMenu} className="text-zinc-400 hover:text-white transition py-1">Back to Kikalo</a>
              <a 
                href="#configurator" 
                onClick={closeMobileMenu}
                className="mt-2 inline-flex w-full items-center justify-center rounded-full border border-white/20 px-4 py-2 text-xs font-medium tracking-widest transition hover:bg-white hover:text-black"
              >
                CONFIGURATOR
              </a>
            </div>
          </div>
        )}
      </nav>

      <NovaShellClientWrapper />

      <footer className="border-t border-white/10 bg-zinc-950 py-10">
        <div className="mx-auto max-w-4xl px-6 text-center text-xs text-zinc-500">
          Questions about volume pricing, custom finishes, or integration? 
          <a href="mailto:admin@kikalo.net" className="underline underline-offset-2 hover:text-white">Contact us</a>
        </div>
      </footer>
    </main>
  )
}
