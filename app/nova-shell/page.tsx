import type { Metadata } from 'next'
import { SiteNav } from '@/components/SiteNav'
import { NovaShellClientWrapper } from '@/components/configurator/NovaShellClientWrapper'

export const metadata: Metadata = {
  title: 'NovaShell | Premium Custom Aluminum Enclosures',
  description: 'Precision-engineered custom aluminum enclosures for Raspberry Pi, Jetson, custom electronics, and OEM applications. Preconfigured sizes ready to ship from North Texas. Full custom available.',
}

export default function NovaShellPage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white selection:bg-white selection:text-black">
      <SiteNav />

      <NovaShellClientWrapper />

      <footer className="border-t border-white/10 bg-zinc-950 py-10">
        <div className="mx-auto max-w-4xl px-6 text-center text-xs text-zinc-500">
          Questions about volume pricing, custom finishes, or integration?{' '}
          <a href="mailto:admin@kikalo.net" className="underline underline-offset-2 hover:text-white">Contact us</a>
        </div>
      </footer>
    </main>
  )
}
