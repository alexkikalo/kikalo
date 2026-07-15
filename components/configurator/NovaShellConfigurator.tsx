'use client'

import { useState, useEffect } from 'react'
import { ThreeDViewer } from './ThreeDViewer'
import { OnshapeGeometry } from './OnshapeGeometry'
import { PurchaseModal } from './PurchaseModal'
import { variants, getVariantById, defaultVariantId, type NovaShellVariant } from '@/lib/variants'
import { Download, MessageCircle, ShoppingCart, ArrowRight, Star } from 'lucide-react'

// Default custom dimensions (reasonable starting point near Standard size)
const DEFAULT_CUSTOM_DIMS = { width: 120, depth: 95, height: 45 }

// Reasonable ranges for formed sheet metal enclosures
const CUSTOM_RANGES = {
  width: { min: 70, max: 250, step: 1 },
  depth: { min: 50, max: 160, step: 1 },
  height: { min: 25, max: 80, step: 1 },
}

export function NovaShellConfigurator() {
  const [selectedId, setSelectedId] = useState(defaultVariantId)
  const [mode, setMode] = useState<'preset' | 'custom'>('preset')
  const [customDimensions, setCustomDimensions] = useState(DEFAULT_CUSTOM_DIMS)
  const [modalMode, setModalMode] = useState<'purchase' | 'quote'>('purchase')
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Onshape geometry fetching state
  const [isLoadingGeometry, setIsLoadingGeometry] = useState(false)
  const [geometryData, setGeometryData] = useState<any>(null)
  const [geometryError, setGeometryError] = useState<string | null>(null)

  const selectedVariant = getVariantById(selectedId) || variants[0]

  // Create a temporary variant object for custom sizes so ThreeDViewer can use it
  const customVariant: NovaShellVariant = {
    id: 'custom',
    name: 'Custom NovaShell',
    description: 'Made-to-order formed aluminum enclosure with your specified dimensions.',
    dimensions: customDimensions,
    price: 0,
    leadTime: 'Made-to-order • 5–10 business days',
    useCase: 'Custom electronics, prototypes, or OEM applications with specific size requirements.',
    material: '6061-T6 Aluminum',
    finish: 'Type II Clear Anodize (custom finishes available on request)',
    estWeight: 'Calculated on order',
    stepFileName: 'novashell-custom.step',
  }

  // The variant currently being previewed
  const activeVariant = mode === 'custom' ? customVariant : selectedVariant

  // Debounced geometry fetching when in custom mode
  useEffect(() => {
    if (mode !== 'custom') {
      setGeometryData(null)
      setGeometryError(null)
      return
    }

    const timeout = setTimeout(async () => {
      setIsLoadingGeometry(true)
      setGeometryError(null)

      try {
        const params = new URLSearchParams({
          width: customDimensions.width.toString(),
          depth: customDimensions.depth.toString(),
          height: customDimensions.height.toString(),
        })

        const res = await fetch(`/api/onshape/geometry?${params.toString()}`)
        const data = await res.json()

        if (data.success) {
          setGeometryData(data)
          console.log('Onshape geometry response:', data)
        } else {
          setGeometryError(data.error || 'Failed to load geometry')
        }
      } catch (err) {
        setGeometryError('Network error while loading geometry')
        console.error(err)
      } finally {
        setIsLoadingGeometry(false)
      }
    }, 600) // Debounce

    return () => clearTimeout(timeout)
  }, [mode, customDimensions])

  const handleSelectVariant = (id: string) => {
    setMode('preset')
    setSelectedId(id)
    if (window.innerWidth < 1024) {
      const viewer = document.getElementById('novashell-viewer')
      viewer?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const switchToCustom = () => setMode('custom')
  const switchToPreset = () => setMode('preset')

  // Update a single dimension
  const updateDimension = (key: 'width' | 'depth' | 'height', value: number) => {
    setCustomDimensions(prev => ({ ...prev, [key]: value }))
    if (mode !== 'custom') setMode('custom')
  }

  const openPurchase = () => { setModalMode('purchase'); setIsModalOpen(true) }
  const openQuote = () => { setModalMode('quote'); setIsModalOpen(true) }

  const handleDownloadSTEP = (variant: NovaShellVariant) => {
    // Clean placeholder STEP content (real files should be placed in /public/downloads/)
    const content = `ISO-10303-21;
HEADER;
FILE_DESCRIPTION(('NovaShell ${variant.name} STEP export placeholder'),'2;1');
FILE_NAME('${variant.stepFileName}','${new Date().toISOString()}',('Kikalo Engineering'),('NovaShell by Kikalo.net'),'','SolidWorks / Onshape export','');
FILE_SCHEMA(('AUTOMOTIVE_DESIGN { 1 0 10303 214 1 1 1 }'));
ENDSEC;
DATA;
#1 = APPLICATION_CONTEXT('mechanical design');
/* This is a placeholder. Replace with real STEP export from Onshape/SolidWorks. */
ENDSEC;
END-ISO-10303-21;`

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
            {/* Show real Onshape geometry when available in custom mode */}
            {mode === 'custom' && geometryData && !geometryError ? (
              <OnshapeGeometry
                geometryData={geometryData}
                isLoading={isLoadingGeometry}
                error={geometryError}
              />
            ) : (
              <ThreeDViewer variant={activeVariant} />
            )}

            <div className="mt-4 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-xs text-zinc-500">
              <div>6061-T6 Aluminum</div><div>Type II Anodize</div><div>Precision CNC + Laser</div><div>Modular plate design</div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="sticky top-6 space-y-6">
              {/* Mode Toggle */}
              <div className="flex rounded-2xl border border-zinc-800 bg-zinc-950 p-1">
                <button
                  onClick={switchToPreset}
                  className={`flex-1 rounded-xl py-2.5 text-sm font-medium transition ${mode === 'preset' ? 'bg-white text-black shadow' : 'text-zinc-400 hover:text-white'}`}
                >
                  Preset Sizes
                </button>
                <button
                  onClick={switchToCustom}
                  className={`flex-1 rounded-xl py-2.5 text-sm font-medium transition ${mode === 'custom' ? 'bg-white text-black shadow' : 'text-zinc-400 hover:text-white'}`}
                >
                  Custom Size
                </button>
              </div>

              {/* Preset Sizes Grid */}
              {mode === 'preset' && (
                <div>
                  <div className="mb-3 flex items-center justify-between px-1">
                    <div className="text-sm font-medium tracking-widest text-zinc-400">PRECONFIGURED SIZES</div>
                    <div className="text-[10px] text-zinc-500">EDIT IN lib/variants.ts</div>
                  </div>
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
              )}

              {/* Custom Size Controls */}
              {mode === 'custom' && (
                <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
                  <div className="mb-4">
                    <div className="text-sm font-medium tracking-widest text-zinc-400">CUSTOM SIZE</div>
                    <div className="text-xs text-zinc-500">Live 3D preview • Made to order</div>
                  </div>

                  {/* Geometry Status */}
                  <div className="mb-4 text-xs">
                    {isLoadingGeometry && (
                      <div className="text-amber-400">Loading precise preview…</div>
                    )}
                    {geometryData && !isLoadingGeometry && (
                      <div className="text-emerald-400">Precise preview ready</div>
                    )}
                    {geometryError && (
                      <div className="text-red-400">Could not load precise preview</div>
                    )}
                    {!isLoadingGeometry && !geometryData && !geometryError && (
                      <div className="text-zinc-500">Using fast preview</div>
                    )}
                  </div>

                  {/* Live Dimension Controls */}
                  <div className="space-y-5">
                    {(['width', 'depth', 'height'] as const).map((key) => {
                      const label = key === 'width' ? 'Width' : key === 'depth' ? 'Depth' : 'Height'
                      const unit = 'mm'
                      const value = customDimensions[key]
                      const range = CUSTOM_RANGES[key]

                      return (
                        <div key={key}>
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="text-sm font-medium text-white">{label}</div>
                            <div className="font-mono text-sm tabular-nums text-white">{value} {unit}</div>
                          </div>
                          <div className="flex items-center gap-3">
                            <input
                              type="range"
                              min={range.min}
                              max={range.max}
                              step={range.step}
                              value={value}
                              onChange={(e) => updateDimension(key, parseInt(e.target.value))}
                              className="flex-1 accent-white"
                            />
                            <input
                              type="number"
                              min={range.min}
                              max={range.max}
                              step={range.step}
                              value={value}
                              onChange={(e) => updateDimension(key, Math.max(range.min, Math.min(range.max, parseInt(e.target.value) || range.min)))}
                              className="w-20 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-right font-mono text-sm text-white focus:border-white/60 focus:outline-none"
                            />
                          </div>
                          <div className="mt-0.5 flex justify-between text-[10px] text-zinc-500">
                            <div>{range.min}</div>
                            <div>{range.max}</div>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  <div className="mt-4 text-[10px] text-zinc-500">
                    Dimensions update the preview. A more precise version is loading in the background.
                  </div>
                </div>
              )}

              {/* Selected / Summary Card */}
              <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
                <div className="mb-4"><div className="text-xs tracking-[1.5px] text-zinc-500">SELECTED</div><div className="text-2xl font-semibold tracking-tight text-white">{activeVariant.name}</div></div>
                <div className="mb-6 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                  <div><div className="text-[10px] text-zinc-500">EXTERNAL</div><div className="font-mono text-white">{activeVariant.dimensions.width} × {activeVariant.dimensions.depth} × {activeVariant.dimensions.height} mm</div></div>
                  <div><div className="text-[10px] text-zinc-500">MATERIAL / FINISH</div><div className="text-white">{activeVariant.material}<br />{activeVariant.finish}</div></div>
                  <div><div className="text-[10px] text-zinc-500">EST. WEIGHT</div><div className="text-white">{activeVariant.estWeight}</div></div>
                  <div><div className="text-[10px] text-zinc-500">LEAD TIME</div><div className="font-medium text-emerald-400">{activeVariant.leadTime}</div></div>
                </div>
                <div className="mb-6 rounded-2xl bg-zinc-900/60 p-4 text-sm text-zinc-300"><span className="font-medium text-white">Best for:</span> {activeVariant.useCase}</div>
                <div className="space-y-3">
                  <button onClick={openPurchase} className="flex w-full items-center justify-center gap-3 rounded-2xl bg-white py-4 text-sm font-semibold text-black transition active:bg-zinc-200"><ShoppingCart className="h-4 w-4" /> BUY NOW — ${activeVariant.price || 'Quote'}</button>
                  <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => handleDownloadSTEP(activeVariant)} className="flex items-center justify-center gap-2 rounded-2xl border border-zinc-700 py-3.5 text-sm font-medium text-white transition hover:bg-zinc-900 active:bg-zinc-950"><Download className="h-4 w-4" /> DOWNLOAD STEP</button>
                    <button onClick={openQuote} className="flex items-center justify-center gap-2 rounded-2xl border border-white/20 py-3.5 text-sm font-medium text-white transition hover:bg-white/5"><MessageCircle className="h-4 w-4" /> REQUEST CUSTOM</button>
                  </div>
                </div>
                <p className="mt-4 text-center text-[10px] text-zinc-500">Prices in USD • Volume discounts available • Made in USA</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <PurchaseModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} variant={activeVariant} mode={modalMode} />
    </div>
  )
}
