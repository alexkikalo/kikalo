import type { Metadata } from 'next'
import { SiteNav } from '@/components/SiteNav'
import { PREPConfigurator } from '@/components/configurator/PREPConfigurator'

export const metadata: Metadata = {
  title: 'PREP Configurator | Product Risk Evaluation & Prevention | Kikalo',
  description: 'Interactive FMEA configurator. Add components and process steps, score failure modes with S/O/D, calculate RPNs, and export professional reports. Free streamlined format • Paid VDA & PDF exports.',
}

export default function FMEAPage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white selection:bg-white selection:text-black">
      <SiteNav />
      <PREPConfigurator />
      <footer className="border-t border-white/10 bg-zinc-950 py-10">
        <div className="mx-auto max-w-4xl px-6 text-center text-xs text-zinc-500">
          PREP by Kikalo • Built for American engineers who need clarity, not complexity.{' '}
          <a href="mailto:admin@kikalo.net" className="underline underline-offset-2 hover:text-white">Feedback welcome</a>
        </div>
      </footer>
    </main>
  )
}
