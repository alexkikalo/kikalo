import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, FileSpreadsheet, Layers, ShieldCheck, Sparkles } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Smart FMEA | Coming Soon | Kikalo',
  description: 'Guided DFMEA, PFMEA, and Control Plan generator. Smart FMEA from Kikalo — coming soon. Export to PDF or spreadsheet.',
}

export default function FMEAComingSoonPage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white selection:bg-white selection:text-black">
      {/* Nav — matches site style */}
      <nav className="border-b border-white/10 bg-zinc-950/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3">
            <img
              src="/images/Color.png"
              alt="Kikalo Logo"
              className="h-8 w-auto"
            />
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Kikalo
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative flex min-h-[80vh] flex-col items-center justify-center px-6 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs tracking-[2px] text-zinc-400 mb-8">
            <Sparkles className="h-3.5 w-3.5" />
            COMING SOON
          </div>

          <h1 className="text-5xl md:text-7xl font-semibold tracking-tighter text-white mb-6">
            Smart FMEA
          </h1>

          <p className="text-xl md:text-2xl text-zinc-300 mb-4 max-w-2xl mx-auto leading-relaxed">
            Guided DFMEA, PFMEA & Control Plans.
            <br />
            <span className="text-zinc-400 text-lg">From blank sheet to professional deliverable in minutes.</span>
          </p>

          <p className="text-zinc-500 text-base mb-12 max-w-xl mx-auto">
            A step-by-step intelligence layer that walks engineers and quality teams through failure modes, effects, controls, and risk priority — then exports clean PDF or spreadsheet files ready for reviews and audits.
          </p>

          {/* Feature cards */}
          <div className="grid sm:grid-cols-3 gap-4 mb-14 text-left">
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
              <Layers className="h-5 w-5 text-white mb-3" />
              <div className="font-medium text-sm mb-1">DFMEA + PFMEA</div>
              <p className="text-xs text-zinc-500">Design and Process FMEA templates with smart defaults and severity/occurrence/detection scoring.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
              <ShieldCheck className="h-5 w-5 text-white mb-3" />
              <div className="font-medium text-sm mb-1">Control Plans</div>
              <p className="text-xs text-zinc-500">Linked process controls that stay consistent with your FMEA outputs.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
              <FileSpreadsheet className="h-5 w-5 text-white mb-3" />
              <div className="font-medium text-sm mb-1">PDF & Spreadsheet</div>
              <p className="text-xs text-zinc-500">One-click export to professional Excel or PDF formats for sharing and archival.</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="mailto:admin@kikalo.net?subject=Smart%20FMEA%20Early%20Access"
              className="inline-flex items-center justify-center rounded-2xl bg-white px-8 py-3.5 text-sm font-semibold text-black transition hover:bg-zinc-200 active:scale-[0.98]"
            >
              Request Early Access
            </a>
            <Link
              href="/nova-shell"
              className="inline-flex items-center justify-center rounded-2xl border border-white/20 px-8 py-3.5 text-sm font-medium text-white transition hover:bg-white/10"
            >
              Explore NovaShell
            </Link>
          </div>

          <p className="mt-10 text-xs text-zinc-600">
            Part of the Kikalo platform — tools for builders who ship real hardware.
          </p>
        </div>
      </section>

      <footer className="border-t border-white/10 py-10 text-center text-xs text-zinc-500">
        © {new Date().getFullYear()} Kikalo • North Texas • Precision American Manufacturing
      </footer>
    </main>
  )
}
