'use client';

import Link from 'next/link';
import { ArrowRight, Box, Cpu, Wrench } from 'lucide-react';
import { SiteNav } from '@/components/SiteNav';

export default function KikaloHome() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <SiteNav />

      {/* Hero with Video Background */}
      <section className="relative flex min-h-[90vh] items-center justify-center overflow-hidden border-b border-white/10">
        {/* Background Video */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover brightness-[0.55]"
        >
          <source src="/videos/Patribotic.mp4" type="video/mp4" />
        </video>

        <div className="absolute inset-0 bg-black/40" />

        <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs tracking-[2.5px] text-zinc-400 mb-6">
            TOOLS FOR BUILDERS • MADE IN TEXAS
          </div>

          <h1 className="text-balance text-7xl font-semibold tracking-tighter md:text-8xl text-white drop-shadow-lg">
            We can shape the<br />American Tomorrow.
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-xl text-zinc-200">
            Precision hardware. Intelligent software. Durable tools for makers, engineers, and teams who demand quality.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="#capabilities"
              className="group inline-flex items-center gap-3 rounded-2xl bg-white px-10 py-4 text-base font-semibold text-black transition active:scale-[0.985]"
            >
              Explore Our Tools
              <ArrowRight className="h-5 w-5 transition group-hover:translate-x-0.5" />
            </Link>

            <a
              href="/#about"
              className="inline-flex items-center gap-3 rounded-2xl border border-white/20 px-8 py-4 text-base font-medium transition hover:bg-white/10 text-white"
            >
              About Kikalo
            </a>
          </div>
        </div>
      </section>

      {/* Trust / Quick value props */}
      <section className="border-b border-white/10 py-12">
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 px-6 md:grid-cols-3">
          {[
            { icon: Box, label: "Premium Hardware", desc: "Formed aluminum systems designed for real engineering use and built to last decades." },
            { icon: Cpu, label: "Intelligent Software", desc: "Guided tools that turn complex engineering workflows into clean, professional deliverables." },
            { icon: Wrench, label: "Built for Builders", desc: "Every product is made to be repaired, upgraded, and handed down. American craftsmanship meets modern digital manufacturing." },
          ].map((item, index) => (
            <div key={index} className="flex flex-col items-center text-center">
              <div className="mb-4 rounded-2xl border border-white/10 p-3">
                <item.icon className="h-6 w-6" />
              </div>
              <div className="font-semibold text-lg">{item.label}</div>
              <p className="mt-2 max-w-[280px] text-sm text-zinc-400">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* About / Kikalo intro */}
      <section id="about" className="mx-auto max-w-3xl px-6 py-20 text-center">
        <div className="text-sm tracking-[3px] text-zinc-500 mb-3">EST. NORTH TEXAS</div>
        <h2 className="text-4xl font-semibold tracking-tight">Kikalo builds durable tools for the builders of tomorrow.</h2>
        <p className="mt-6 text-lg text-zinc-400">
          We create premium physical products and intelligent software that help engineers, makers, and teams move faster without sacrificing quality.
          From custom aluminum enclosures to guided FMEA and control-plan tools, everything is designed to be practical, repairable, and built to last.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="#capabilities" className="text-sm font-medium underline underline-offset-4 hover:no-underline">
            See what we offer →
          </Link>
        </div>
      </section>

      {/* Capabilities / Products */}
      <section id="capabilities" className="border-t border-white/10 bg-zinc-900/40 py-20">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center mb-14">
            <div className="text-xs tracking-[2px] text-zinc-400">WHAT WE BUILD</div>
            <h3 className="text-3xl md:text-4xl font-semibold tracking-tight mt-2">Useful tools for serious work</h3>
            <p className="mt-4 text-zinc-400 max-w-xl mx-auto">
              Hardware that ships fast. Software that removes friction. Both designed for people who build real things.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* NovaShell card */}
            <div className="rounded-3xl border border-white/10 bg-zinc-950/60 p-8 flex flex-col">
              <div className="font-semibold text-xl mb-2">NovaShell</div>
              <div className="text-xs tracking-wider text-zinc-500 mb-4">CUSTOM ALUMINUM ENCLOSURES</div>
              <p className="text-zinc-400 flex-1">
                Premium formed-sheet-metal enclosures for SBCs, embedded systems, and OEM electronics. Preconfigured sizes ready to ship + full made-to-order custom capability via SendCutSend. Hybrid fulfillment keeps common shells shipping in days.
              </p>
              <Link
                href="/nova-shell"
                className="mt-8 inline-flex items-center justify-center rounded-2xl bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200 active:scale-[0.98] group"
              >
                Open Configurator
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-0.5 transition" />
              </Link>
            </div>

            {/* PREP FMEA card - updated */}
            <div className="rounded-3xl border border-white/10 bg-zinc-950/60 p-8 flex flex-col">
              <div className="flex items-center gap-2 mb-2">
                <div className="font-semibold text-xl">PREP</div>
                <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-2 py-0.5 text-[10px] font-medium tracking-wider text-blue-400">COMING SOON</span>
              </div>
              <div className="text-xs tracking-wider text-zinc-500 mb-4">PRODUCT RISK EVALUATION & PREVENTION — AMERICA'S FMEA</div>
              <p className="text-zinc-400 flex-1">
                The intuitive web-based FMEA configurator. Start free with our streamlined new format. Paid unlocks one-click exports to VDA, AIAG, PDF, and professional templates. Bird's-eye risk overview with industrial blue clarity. Built to be teachable and fast.
              </p>
              <Link
                href="/fmea"
                className="mt-8 inline-flex items-center justify-center rounded-2xl border border-white/20 px-6 py-3 text-sm font-medium text-white transition hover:bg-white/10 group"
              >
                Learn more
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-0.5 transition" />
              </Link>
            </div>
          </div>

          <div className="mt-10 text-center">
            <p className="text-sm text-zinc-500">
              More tools are in development. Built the same way: practical, premium, and useful from day one.
            </p>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 py-10 text-center text-xs text-zinc-500">
        © {new Date().getFullYear()} Kikalo
      </footer>
    </main>
  );
}
