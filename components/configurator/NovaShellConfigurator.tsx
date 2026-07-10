'use client'

import { useState } from 'react'
import { ThreeDViewer } from './ThreeDViewer'
import { PurchaseModal } from './PurchaseModal'
import { variants, getVariantById, defaultVariantId, type NovaShellVariant } from '@/lib/variants'
import { Download, MessageCircle, ShoppingCart, ArrowRight, Star } from 'lucide-react'

export function NovaShellConfigurator() {
  const [selectedId, setSelectedId] = useState(defaultVariantId)
  const [modalMode, setModalMode] = useState<'purchase' | 'quote'>('purchase')
  const [isModalOpen, setIsModalOpen] = useState(false)

  const selectedVariant = getVariantById(selectedId) || variants[0]

  const handleSelectVariant = (id: string) => {
    setSelectedId(id)
    if (window.innerWidth < 1024) {
      const viewer = document.getElementById('novashell-viewer')
      viewer?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const openPurchase = () => { setModalMode('purchase'); setIsModalOpen(true) }
  const openQuote = () => { setModalMode('quote'); setIsModalOpen(true) }

  const handleDownloadSTEP = (variant: NovaShellVariant) => {
    const content = `ISO-10303-21;\nHEADER;\nFILE_DESCRIPTION(('NovaShell ${variant.name} STEP export placeholder'),'2;1');\nFILE_NAME('${variant.stepFileName}','${new Date().toISOString()}',('Kikalo Engineering'),('NovaShell by Kikalo.net'),'','SolidWorks / Onshape export','');\nFILE_SCHEMA(('AUTOMOTIVE_DESIGN { 1 0 10303 214 1 1 1 }'));\nENDSEC;\nDATA;\n#1 = APPLICATION_CONTEXT('mechanical design');\n/* \n  This is a placeholder .step file.\n  \n  HOW TO CONNECT REAL FILES:\n  1. Export real STEP from Onshape or SolidWorks.\n  2. Place files in /public/downloads/\n  3. Update this function to window.open(`/downloads/${variant.stepFileName}`, '_blank')\n*/\nENDSEC;\nEND-ISO-10303-21;`
    const blob = new Blob([content], { type: 'application/step' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = variant.stepFileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="w-full">
      <div className="mx-auto max-w-5xl px-6 pb-8 pt-12 text-center md:pt-16">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs tracking-[2px] text-zinc-400">MADE IN TEXAS • PREMIUM MODULAR ALUMINUM</div>
        <h1 className="mt-6 text-balance text-6xl font-semibold tracking-tighter text-white md:text-7xl">NovaShell</h1>
        <p className="mx-auto mt-4 max-w-md text-xl text-zinc-400">Precision modular aluminum enclosures for makers, engineers, and OEMs.<br />Built to last. Ready to ship.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <button onClick={() => document.getElementById('configurator')?.scrollIntoView({ behavior: 'smooth' })} className="group inline-flex items-center gap-3 rounded-2xl bg-white px-8 py-4 text-sm font-semibold text-black transition active:scale-[0.985]">BROWSE PRECONFIGURED SIZES <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" /></button>
          <button onClick={openQuote} className="inline-flex items-center gap-3 rounded-2xl border border-white/20 px-8 py-4 text-sm font-medium text-white transition hover:bg-white/5 active:bg-white/10">REQUEST FULLY CUSTOM</button>
        </div>
        <p className="mt-4 text-xs text-zinc-500">Ships from North Texas • 1–7 day lead times • Volume pricing available</p>
      </div>

      <div id="configurator" className="mx-auto max-w-7xl px-6 pb-20">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-5 lg:gap-10">
          <div id="novashell-viewer" className="lg:col-span-3">
            <ThreeDViewer variant={selectedVariant} />
            <div className="mt-4 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-xs text-zinc-500">
              <div>6061-T6 Aluminum</div><div>Type II Anodize</div><div>Precision CNC + Laser</div><div>Modular plate design</div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="sticky top-6 space-y-6">
              <div>
                <div className="mb-3 flex items-center justify-between px-1"><div className="text-sm font-medium tracking-widest text-zinc-400">PRECONFIGURED SIZES</div><div className="text-[10px] text-zinc-500">EDIT IN lib/variants.ts</div></div>
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-1">
                  {variants.map((variant) => {
                    const isActive = variant.id === selectedId
                    return (
                      <button key={variant.id} onClick={() => handleSelectVariant(variant.id)} className={`group w-full rounded-3xl border p-4 text-left transition-all active:scale-[0.985] ${isActive ? 'border-white/70 bg-zinc-900 shadow-xl' : 'border-zinc-800 bg-zinc-950 hover:border-zinc-700 hover:bg-zinc-900/70'}`}>
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2"><span className="font-semibold text-white">{variant.name}</span>{variant.popular && <span className="inline-flex items-center gap-px rounded bg-emerald-500/10 px-1.5 py-px text-[9px] font-medium text-emerald-400"><Star className="h-2.5 w-2.5" /> POPULAR</span>}</div>
                            <div className="mt-0.5 text-xs text-zinc-400 line-clamp-2 pr-2">{variant.description}</div>
                          </div>
                          <div className="text-right font-mono text-xl font-semibold tabular-nums text-white">${variant.price}</div>
                        </div>
                        <div className="mt-3 flex items-center justify-between text-[10px]"><div className="font-mono text-zinc-500">{variant.dimensions.width}×{variant.dimensions.depth}×{variant.dimensions.height} mm</div><div className="text-emerald-400/90">{variant.leadTime}</div></div>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
                <div className="mb-4"><div className="text-xs tracking-[1.5px] text-zinc-500">SELECTED</div><div className="text-2xl font-semibold tracking-tight text-white">{selectedVariant.name}</div></div>
                <div className="mb-6 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                  <div><div className="text-[10px] text-zinc-500">EXTERNAL</div><div className="font-mono text-white">{selectedVariant.dimensions.width} × {selectedVariant.dimensions.depth} × {selectedVariant.dimensions.height} mm</div></div>
                  <div><div className="text-[10px] text-zinc-500">MATERIAL / FINISH</div><div className="text-white">{selectedVariant.material}<br />{selectedVariant.finish}</div></div>
                  <div><div className="text-[10px] text-zinc-500">EST. WEIGHT</div><div className="text-white">{selectedVariant.estWeight}</div></div>
                  <div><div className="text-[10px] text-zinc-500">LEAD TIME</div><div className="font-medium text-emerald-400">{selectedVariant.leadTime}</div></div>
                </div>
                <div className="mb-6 rounded-2xl bg-zinc-900/60 p-4 text-sm text-zinc-300"><span className="font-medium text-white">Best for:</span> {selectedVariant.useCase}</div>
                <div className="space-y-3">
                  <button onClick={openPurchase} className="flex w-full items-center justify-center gap-3 rounded-2xl bg-white py-4 text-sm font-semibold text-black transition active:bg-zinc-200"><ShoppingCart className="h-4 w-4" /> BUY NOW — ${selectedVariant.price}</button>
                  <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => handleDownloadSTEP(selectedVariant)} className="flex items-center justify-center gap-2 rounded-2xl border border-zinc-700 py-3.5 text-sm font-medium text-white transition hover:bg-zinc-900 active:bg-zinc-950"><Download className="h-4 w-4" /> DOWNLOAD STEP</button>
                    <button onClick={openQuote} className="flex items-center justify-center gap-2 rounded-2xl border border-white/20 py-3.5 text-sm font-medium text-white transition hover:bg-white/5"><MessageCircle className="h-4 w-4" /> REQUEST CUSTOM</button>
                  </div>
                </div>
                <p className="mt-4 text-center text-[10px] text-zinc-500">Prices in USD • Volume discounts available • Made in USA</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <PurchaseModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} variant={selectedVariant} mode={modalMode} />
    </div>
  )
}
