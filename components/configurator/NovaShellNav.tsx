'use client';

import { useState } from 'react';
import { Menu, X } from 'lucide-react';

export function NovaShellNav() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <nav className="border-b border-white/10 bg-zinc-950/80 backdrop-blur-lg z-50">
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
        <div className="md:hidden relative z-50 border-t border-white/10 bg-zinc-950/95 px-6 py-4 shadow-lg">
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
  );
}
