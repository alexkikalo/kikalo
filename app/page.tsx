'use client';

import Link from 'next/link';
import { ArrowRight, Box, Award, Clock } from 'lucide-react';

export default function KikaloHome() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      {/* Simple professional nav */}
      <nav className="border-b border-white/10 bg-zinc-950/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link href="/" className="flex items-center gap-3">
            <img 
              src="/images/Color Logo.png" 
              alt="Kikalo Logo" 
              className="h-9 w-auto" 
            />
          </Link>
          <div className="flex items-center gap-8 text-sm">
            <Link href="/nova-shell" className="font-medium text-white hover:text-zinc-300 transition">NovaShell</Link>
            <a href="#about" className="text-zinc-400 hover:text-white transition">About</a>
            <a href="#capabilities" className="text-zinc-400 hover:text-white transition">Capabilities</a>
            <Link href="/nova-shell" className="rounded-full border border-white/20 px-5 py-1.5 text-xs font-medium tracking-widest transition hover:bg-white hover:text-black">
              CONFIGURATOR
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative flex min-h-[90vh] items-center justify-center overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(#27272a_0.8px,transparent_1px)] bg-[length:4px_4px]" />
        
        <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs tracking-[2.5px] text-zinc-400 mb-6">
            MADE IN TEXAS • AMERICAN MANUFACTURING
          </div>
          
          <h1 className="text-balance text-7xl font-semibold tracking-tighter md:text-8xl">
            We can shape the<br />American Tomorrow.
          </h1>
          
          <p className="mx-auto mt-6 max-w-md text-xl text-zinc-400">
            Precision engineering. Modular aluminum enclosures. 
            Built for makers, engineers, and OEMs who demand quality.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link 
              href="/nova-shell" 
              className="group inline-flex items-center gap-3 rounded-2xl bg-white px-10 py-4 text-base font-semibold text-black transition active:scale-[0.985]"
            >
              Launch NovaShell Configurator
              <ArrowRight className="h-5 w-5 transition group-hover:translate-x-0.5" />
            </Link>
            
            <a 
              href="#capabilities" 
              className="inline-flex items-center gap-3 rounded-2xl border border-white/20 px-8 py-4 text-base font-medium transition hover:bg-white/5"
            >
              Explore Capabilities
            </a>
          </div>

          <p className="mt-6 text-xs text-zinc-500">NovaShell preconfigured sizes ship in 1–7 days • Full custom available</p>
        </div>
      </section>

      {/* Trust / Quick value props */}
      <section className="border-b border-white/10 py-12">
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 px-6 md:grid-cols-3">
          {[ 
            { icon: Box, label: "Modular by Design", desc: "Swap plates, expand later. Built for real engineering workflows." },
            { icon: Award, label: "Premium Materials", desc: "6061-T6 Aluminum with Type II anodize. Made to last decades." },
            { icon: Clock, label: "Fast Texas Production", desc: "Most preconfigured NovaShell units ship in 1–7 business days." },
          ].map((item, index) => (
            <div key={index} className="flex flex-col items-center text-center">
              <div className="mb-4 rounded-2xl border border-white/10 p-3">
                <item.icon className="h-6 w-6" />
              </div>
              <div className="font-semibold text-lg">{item.label}</div>
              <p className="mt-2 max-w-[260px] text-sm text-zinc-400">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* About / Kikalo intro */}
      <section id="about" className="mx-auto max-w-3xl px-6 py-20 text-center">
        <div className="text-sm tracking-[3px] text-zinc-500 mb-3">EST. NORTH TEXAS</div>
        <h2 className="text-4xl font-semibold tracking-tight">Kikalo is building durable tools for the builders of tomorrow.</h2>
        <p className="mt-6 text-lg text-zinc-400">
          From precision enclosures to custom mechanical systems, we combine old-world craftsmanship with modern digital manufacturing. 
          Every product is designed to be repaired, upgraded, and passed down.
        </p>
        <div className="mt-8">
          <Link href="/nova-shell" className="text-sm font-medium underline underline-offset-4 hover:no-underline">
            See our flagship product line → NovaShell
          </Link>
        </div>
      </section>

      {/* Capabilities teaser */}
      <section id="capabilities" className="border-t border-white/10 bg-zinc-900/40 py-16">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center mb-12">
            <div className="text-xs tracking-[2px] text-emerald-400">WHAT WE BUILD</div>
            <h3 className="text-3xl font-semibold tracking-tight mt-2">Engineering-grade products for serious makers & teams</h3>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="rounded-3xl border border-white/10 p-8">
              <div className="font-semibold text-xl mb-3">NovaShell Enclosures</div>
              <p className="text-zinc-400">Premium modular aluminum enclosures for SBCs, embedded systems, and OEM electronics. Preconfigured sizes ready to ship + full custom capability.</p>
              <Link href="/nova-shell" className="mt-6 inline-flex items-center text-sm font-medium text-white group">Open Configurator <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-0.5 transition" /></Link>
            </div>
            <div className="rounded-3xl border border-white/10 p-8 opacity-75">
              <div className="font-semibold text-xl mb-3">Custom Mechanical Systems</div>
              <p className="text-zinc-400">Machine design, automation fixtures, structural components, and greenfield manufacturing projects. (Coming into focus on this new Next.js site)</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 py-10 text-center text-xs text-zinc-500">
        © {new Date().getFullYear()} Kikalo • North Texas • Precision American Manufacturing
      </footer>
    </main>
  );
}
