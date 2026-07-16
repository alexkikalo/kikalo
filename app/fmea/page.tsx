import type { Metadata } from 'next'
import Link from 'next/link'
import { Eye, Layers, ShieldCheck, FileSpreadsheet, Target, ArrowRight } from 'lucide-react'
import { SiteNav } from '@/components/SiteNav'

export const metadata: Metadata = {
  title: 'PREP | Product Risk Evaluation & Prevention | America\'s FMEA | Kikalo',
  description: 'PREP — America\'s FMEA. The intuitive web-based FMEA configurator from Kikalo. Simpler new format (free). One-click export to VDA and professional standards (paid). Built for clarity, speed, and American engineering teams.',
}

export default function PREPPage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white selection:bg-white selection:text-black">
      <SiteNav />

      {/* Hero */}
      <section className="relative flex min-h-[85vh] flex-col items-center justify-center px-6 py-20 border-b border-white/10">
        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-xs tracking-[2.5px] text-blue-400 mb-8">
            <Target className="h-3.5 w-3.5" />
            AMERICA'S FMEA
          </div>

          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="text-6xl md:text-7xl font-semibold tracking-tighter text-white">PREP</div>
          </div>
          <p className="text-2xl md:text-3xl font-medium tracking-tight text-blue-400 mb-4">
            Product Risk Evaluation & Prevention
          </p>

          <p className="text-xl md:text-2xl text-zinc-300 mb-6 max-w-3xl mx-auto leading-relaxed">
            The intuitive web-based FMEA configurator built for American engineers.
          </p>

          <p className="text-lg text-zinc-400 max-w-2xl mx-auto mb-10">
            A clear, complete view of your design and process risks. Modern configurator speed with industrial blue clarity.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="mailto:admin@kikalo.net?subject=PREP%20Early%20Access"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-blue-500 active:scale-[0.98]"
            >
              Request Early Access
              <ArrowRight className="h-4 w-4" />
            </a>
            <Link
              href="/nova-shell"
              className="inline-flex items-center justify-center rounded-2xl border border-white/20 px-8 py-3.5 text-sm font-medium text-white transition hover:bg-white/10"
            >
              Explore NovaShell Configurator
            </Link>
          </div>

          <p className="mt-8 text-xs text-zinc-500 tracking-widest">FREE TIER AVAILABLE IN PREVIEW • PAID UNLOCKS VDA & PROFESSIONAL EXPORTS</p>
        </div>
      </section>

      {/* Business Case */}
      <section className="mx-auto max-w-4xl px-6 py-16 text-center border-b border-white/10">
        <div className="max-w-3xl mx-auto">
          <div className="uppercase tracking-[3px] text-xs text-blue-400 mb-3">THE REALITY CHECK</div>
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-6">
            FMEA software is virtually non-existent.<br />And the dominant format is broken for most teams.
          </h2>
          <p className="text-lg text-zinc-400 leading-relaxed">
            The common VDA format (and its AIAG-VDA successor) is powerful on paper but notoriously difficult to teach, difficult to understand, and slow to adopt — even half a decade after the current revision. Most engineers still default to brittle spreadsheets or expensive bloated tools that don't fit real workflows.
          </p>
          <p className="mt-6 text-xl font-medium text-white">
            PREP changes that. A cleaner starting point. A modern configurator interface. Professional outputs when you need them.
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-5xl px-6 py-20">
        <div className="text-center mb-12">
          <div className="text-xs tracking-[2px] text-zinc-500 mb-2">THE PREP CONFIGURATOR</div>
          <h3 className="text-3xl md:text-4xl font-semibold tracking-tight">Everything you need. Nothing you don't.</h3>
          <p className="mt-3 text-zinc-400 max-w-md mx-auto">A guided, visual workflow that turns hours of FMEA work into minutes — while producing audit-ready results.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="rounded-3xl border border-white/10 bg-zinc-950/60 p-8">
            <div className="w-11 h-11 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6">
              <Layers className="h-5 w-5 text-blue-400" />
            </div>
            <div className="font-semibold text-xl mb-3">Guided Configurator Interface</div>
            <p className="text-zinc-400">Modern step-by-step web experience. Define functions, failure modes, effects, and scoring (Severity / Occurrence / Detection) with smart defaults and inline guidance. Feels like a product configurator, not a 1990s spreadsheet.</p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-zinc-950/60 p-8">
            <div className="w-11 h-11 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6">
              <Eye className="h-5 w-5 text-blue-400" />
            </div>
            <div className="font-semibold text-xl mb-3">Complete Risk Overview</div>
            <p className="text-zinc-400">Instant visual summary of your full risk profile. See high-risk areas, coverage gaps, and action priorities at a glance before diving into details.</p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-zinc-950/60 p-8">
            <div className="w-11 h-11 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6">
              <ShieldCheck className="h-5 w-5 text-blue-400" />
            </div>
            <div className="font-semibold text-xl mb-3">Linked Control Plans</div>
            <p className="text-zinc-400">Control plans stay automatically synchronized with your FMEA. No copy-paste drift. Prevention and detection actions are traceable and consistent across your quality docs.</p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-zinc-950/60 p-8">
            <div className="w-11 h-11 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6">
              <FileSpreadsheet className="h-5 w-5 text-blue-400" />
            </div>
            <div className="font-semibold text-xl mb-3">Free New Format + Paid Exports</div>
            <p className="text-zinc-400">Start for free with PREP's streamlined, teachable format. When you need compliance or customer deliverables, paid plans export clean VDA, AIAG-VDA, custom Excel templates, and professional PDF reports in one click.</p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-zinc-950/60 p-8 md:col-span-2 lg:col-span-1">
            <div className="w-11 h-11 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6">
              <Target className="h-5 w-5 text-blue-400" />
            </div>
            <div className="font-semibold text-xl mb-3">Built for Real Teams</div>
            <p className="text-zinc-400">Designed from the ground up for speed of adoption. Easier to train new engineers. Faster to complete. Still delivers the rigor and documentation your customers and auditors expect.</p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-white/10 bg-zinc-900/40 py-16">
        <div className="mx-auto max-w-xl px-6 text-center">
          <h3 className="text-2xl font-semibold tracking-tight mb-4">Ready to see risk clearly?</h3>
          <p className="text-zinc-400 mb-8">Join the early access list for the PREP configurator. Free tier includes the full new format. Paid unlocks every export you need.</p>
          
          <a
            href="mailto:admin@kikalo.net?subject=PREP%20FMEA%20Configurator%20Early%20Access"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-10 py-4 text-sm font-semibold text-black transition hover:bg-zinc-200 active:scale-[0.985]"
          >
            Get Early Access
          </a>

          <p className="mt-8 text-xs text-zinc-500">Kikalo • North Texas • American Engineering</p>
        </div>
      </section>

      <footer className="border-t border-white/10 py-8 text-center text-xs text-zinc-500">
        © {new Date().getFullYear()} Kikalo — Tools for Builders
      </footer>
    </main>
  )
}
