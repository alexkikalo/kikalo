'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, ChevronDown } from 'lucide-react';

export function SiteNav() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProductsOpen, setIsProductsOpen] = useState(false);
  const productsRef = useRef<HTMLDivElement>(null);

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    setIsProductsOpen(false);
  };

  // Close desktop dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (productsRef.current && !productsRef.current.contains(event.target as Node)) {
        setIsProductsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="border-b border-white/10 bg-zinc-950/80 backdrop-blur-lg sticky top-0 z-50">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Logo = Home */}
        <Link href="/" className="flex items-center gap-3" onClick={closeMobileMenu}>
          <img
            src="/images/Color.png"
            alt="Kikalo Logo"
            className="h-8 w-auto"
          />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8 text-sm">
          <a href="/#about" className="text-zinc-400 hover:text-white transition">
            About
          </a>
          <a href="/#capabilities" className="text-zinc-400 hover:text-white transition">
            Capabilities
          </a>

          {/* Products Dropdown */}
          <div className="relative" ref={productsRef}>
            <button
              onClick={() => setIsProductsOpen(!isProductsOpen)}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/20 px-5 py-1.5 text-xs font-medium tracking-widest transition hover:bg-white hover:text-black"
            >
              PRODUCTS
              <ChevronDown className={`h-3.5 w-3.5 transition ${isProductsOpen ? 'rotate-180' : ''}`} />
            </button>

            {isProductsOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl border border-white/10 bg-zinc-900 shadow-xl overflow-hidden">
                <Link
                  href="/nova-shell"
                  onClick={() => setIsProductsOpen(false)}
                  className="block px-4 py-3 text-sm text-white hover:bg-white/5 transition"
                >
                  <div className="font-medium">NovaShell</div>
                  <div className="text-xs text-zinc-500 mt-0.5">Custom aluminum enclosures</div>
                </Link>
                <Link
                  href="/fmea"
                  onClick={() => setIsProductsOpen(false)}
                  className="block px-4 py-3 text-sm text-white hover:bg-white/5 transition border-t border-white/5"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium">PREP</span>
                    <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-1.5 py-0.5 text-[10px] tracking-wider text-blue-400">
                      SOON
                    </span>
                  </div>
                  <div className="text-xs text-zinc-500 mt-0.5">America's FMEA • Guided Configurator</div>
                </Link>
              </div>
            )}
          </div>
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

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-white/10 bg-zinc-950/95 px-6 py-4">
          <div className="flex flex-col gap-1 text-sm">
            <a
              href="/#about"
              onClick={closeMobileMenu}
              className="text-zinc-400 hover:text-white transition py-2"
            >
              About
            </a>
            <a
              href="/#capabilities"
              onClick={closeMobileMenu}
              className="text-zinc-400 hover:text-white transition py-2"
            >
              Capabilities
            </a>

            <div className="mt-3 pt-3 border-t border-white/10">
              <div className="text-xs tracking-widest text-zinc-500 mb-2 px-1">PRODUCTS</div>
              <Link
                href="/nova-shell"
                onClick={closeMobileMenu}
                className="block py-2.5 text-white font-medium"
              >
                NovaShell
                <span className="block text-xs text-zinc-500 font-normal mt-0.5">Custom aluminum enclosures</span>
              </Link>
              <Link
                href="/fmea"
                onClick={closeMobileMenu}
                className="block py-2.5 text-white font-medium"
              >
                <span className="flex items-center gap-2">
                  PREP
                  <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-1.5 py-0.5 text-[10px] tracking-wider text-blue-400">
                    SOON
                  </span>
                </span>
                <span className="block text-xs text-zinc-500 font-normal mt-0.5">America's FMEA • Product Risk Evaluation & Prevention</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
