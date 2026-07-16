'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { ThreeDViewer } from './ThreeDViewer'
import { StaticCaseViewer } from './StaticCaseViewer'
import { OnshapeGeometry } from './OnshapeGeometry'
import { PurchaseModal } from './PurchaseModal'
import { variants, getVariantById, defaultVariantId, type NovaShellVariant } from '@/lib/variants'
import { Download, ShoppingCart, Star } from 'lucide-react'

// Default custom dimensions in inches (inside Onshape config ranges)
const DEFAULT_CUSTOM_DIMS = { width: 4.72, depth: 3.74, height: 2.0 }

// UI ranges — kept in sync with Onshape configuration variables
// Onshape now: all axes min 2 in / max 10 in
const CUSTOM_RANGES = {
  width:  { min: 2.0, max: 10.0, step: 0.01 },
  depth:  { min: 2.0, max: 10.0, step: 0.01 },
  height: { min: 2.0, max: 10.0, step: 0.01 },
}

const DEBOUNCE_MS = 450

export function NovaShellConfigurator() {
  const [selectedId, setSelectedId] = useState(defaultVariantId)
  const [mode, setMode] = useState<'preset' | 'custom'>('preset')
  const [customDimensions, setCustomDimensions] = useState(DEFAULT_CUSTOM_DIMS)
  const [modalMode, setModalMode] = useState<'purchase' | 'quote'>('purchase')
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Live Onshape geometry state
  const [onshapeData, setOnshapeData] = useState<any>(null)
  const [onshapeLoading, setOnshapeLoading] = useState(false)
  const [onshapeError, setOnshapeError] = useState<string | null>(null)
  const [useLiveOnshape, setUseLiveOnshape] = useState(true)

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const selectedVariant = getVariantById(selectedId) || variants[0]

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

  const activeVariant = mode === 'custom' ? customVariant : selectedVariant

  const fetchOnshapeGeometry = useCallback(async (dims: typeof DEFAULT_CUSTOM_DIMS) => {
    if (abortRef.current) abortRef.current.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setOnshapeLoading(true)
    setOnshapeError(null)

    try {
      const params = new URLSearchParams({
        width: dims.width.toFixed(3),
        depth: dims.depth.toFixed(3),
        height: dims.height.toFixed(3),
      })

      const res = await fetch(`/api/onshape/geometry?${params.toString()}`, {
        signal: controller.signal,
      })

      const payload = await res.json().catch(() => ({}))

      if (!res.ok) {
        const msg = payload.error || `Onshape error ${res.status}`
        const detail = payload.hint || (payload.attempts ? JSON.stringify(payload.attempts[0], null, 0).slice(0, 180) : null)
        throw new Error(msg + (detail ? ` — ${detail}` : ''))
      }

      if (payload.success && payload.raw) {
        setOnshapeData(payload)
        setOnshapeError(null)
      } else {
        throw new Error(payload.error || 'No geometry returned from Onshape')
      }
    } catch (err: any) {
      if (err.name === 'AbortError') return
      console.warn('Onshape geometry fetch failed:', err)
      setOnshapeError(err.message || 'Failed to load live geometry')
      // Keep any previous successful onshapeData so we don't blank the view
    } finally {
      if (!controller.signal.aborted) {
        setOnshapeLoading(false)
      }
    }
  }, [])

  // Debounced fetch on dimension / mode change
  useEffect(() => {
    if (mode !== 'custom' || !useLiveOnshape) return

    if (debounceRef.current) clearTimeout(debounceRef.current)

    debounceRef.current = setTimeout(() => {
      fetchOnshapeGeometry(customDimensions)
    }, DEBOUNCE_MS)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [customDimensions, mode, useLiveOnshape, fetchOnshapeGeometry])

  // Initial fetch when entering custom
  useEffect(() => {
    if (mode === 'custom' && useLiveOnshape && !onshapeData && !onshapeLoading) {
      fetchOnshapeGeometry(customDimensions)
    }
  }, [mode]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSelectVariant = (id: string) => {
    setMode('preset')
    setSelectedId(id)
    if (window.innerWidth < 1024) {
      document.getElementById('novashell-viewer')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const switchToCustom = () => setMode('custom')
  const switchToPreset = () => setMode('preset')

  const updateDimension = (key: 'width' | 'depth' | 'height', value: number) => {
    setCustomDimensions(prev => ({ ...prev, [key]: value }))
    if (mode !== 'custom') setMode('custom')
  }

  const openPurchase = () => {
    setModalMode('purchase')
    setIsModalOpen(true)
  }

  const handleDownloadSTEP = (variant: NovaShellVariant) => {
    const content = `ISO-10303-21;
HEADER;
FILE_DESCRIPTION(('NovaShell ${variant.name} STEP export placeholder'),'2;1');
FILE_NAME('${variant.stepFileName}','${new Date().toISOString()}',('Kikalo Engineering'),('NovaShell by Kikalo.net'),'','SolidWorks / Onshape export','');
FILE_SCHEMA(('AUTOMOTIVE_DESIGN { 1 0 10303 214 1 1 1 }'));
ENDSEC;
DATA;
#1 = APPLICATION_CONTEXT('mechanical design');
/* Placeholder — replace with real STEP from Onshape */
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

  // Always keep a solid preview. Live Onshape is preferred only when we have good data.
  // On any error or while first loading → show the fast GLTF so the UI never breaks.
  const renderCustomPreview = () => {
    const hasLive = useLiveOnshape && onshapeData && !onshapeError

    if (hasLive) {
      return (
        <OnshapeGeometry
          geometryData={onshapeData}
          isLoading={false}
          error={null}
          className="h-full w-full"
        />
      )
    }

    // Fast fallback (always works)
    return (
      <div className="relative h-full w-full">
        <StaticCaseViewer dimensions={customDimensions} className="h-full w-full" />
        {useLiveOnshape && onshapeLoading && (
          <div className="absolute inset-x-0 top-0 flex justify-center pt-3 pointer-events-none">
            <div className="rounded-full bg-black/70 px-3 py-1 text-[10px] text-zinc-300 backdrop-blur">
              Syncing Onshape…
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="mx-auto max-w-5xl px-6 pb-8 pt-12 text-center md:pt-16">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs tracking-[2px] text-zinc-400">
          MADE IN TEXAS • PREMIUM CUSTOM ALUMINUM
        </div>
        <h1 className="mt-6 text-balance text-6xl font-semibold tracking-tighter text-white md:text-7xl">NovaShell</h1>
        <p className="mx-auto mt-4 max-w-md text-xl text-zinc-400">
          Precision custom aluminum enclosures for makers, engineers, and OEMs.<br />
          Built to last. Ready to ship.
        </p>
      </div>

      <div id="configurator" className="mx-auto max-w-7xl px-6 pb-20">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-5 lg:gap-10">
          {/* Fixed-size preview frame */}
          <div id="novashell-viewer" className="lg:col-span-3">
            <div className="relative w-full overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950 shadow-2xl h-[380px] sm:h-[440px] md:h-[480px] lg:h-[520px]">
              {mode === 'custom' ? renderCustomPreview() : (
                <ThreeDViewer variant={activeVariant} className="h-full w-full" />
              )}
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-xs text-zinc-500">
              <div>6061-T6 Aluminum</div>
              <div>Type II Anodize</div>
              <div>Precision CNC + Laser</div>
              <div>Universal mounting plate</div>
              {mode === 'custom' && useLiveOnshape && (
                <div className={
                  onshapeData && !onshapeError
                    ? 'text-emerald-500'
                    : onshapeError
                      ? 'text-amber-500'
                      : 'text-zinc-500'
                }>
                  {onshapeLoading
                    ? 'Syncing Onshape…'
                    : onshapeData && !onshapeError
                      ? (onshapeData.clamped ? 'Live Onshape (clamped)' : 'Live Onshape')
                      : onshapeError
                        ? 'Onshape offline (using fast preview)'
                        : 'Onshape ready'}
                </div>
              )}
            </div>

            {/* Debug error (only when live mode is on and it failed) */}
            {mode === 'custom' && useLiveOnshape && onshapeError && (
              <div className="mt-3 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-left text-[11px] text-amber-200/90">
                <div className="font-medium text-amber-400 mb-1">Onshape live geometry unavailable</div>
                <div className="text-zinc-400 break-words">{onshapeError}</div>
                <div className="mt-2 text-zinc-500">
                  The fast preview above is still live. Common fixes: check Vercel env vars
                  <code className="mx-1 text-zinc-300">ONSHAPE_NOVASHELL_ACCESS_KEY</code> /
                  <code className="mx-1 text-zinc-300">ONSHAPE_NOVASHELL_SECRET_KEY</code>,
                  document share permissions, or exact config parameter names.
                </div>
              </div>
            )}
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
                        <button
                          key={variant.id}
                          onClick={() => handleSelectVariant(variant.id)}
                          className={`group w-full rounded-3xl border p-4 text-left transition-all active:scale-[0.985] ${isActive ? 'border-white/70 bg-zinc-900 shadow-xl' : 'border-zinc-800 bg-zinc-950 hover:border-zinc-700 hover:bg-zinc-900/70'}`}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-white">{variant.name}</span>
                                {variant.popular && (
                                  <span className="inline-flex items-center gap-px rounded bg-emerald-500/10 px-1.5 py-px text-[9px] font-medium text-emerald-400">
                                    <Star className="h-2.5 w-2.5" /> POPULAR
                                  </span>
                                )}
                              </div>
                              <div className="mt-0.5 text-xs text-zinc-400 line-clamp-2 pr-2">{variant.description}</div>
                            </div>
                            <div className="text-right font-mono text-xl font-semibold tabular-nums text-white">${variant.price}</div>
                          </div>
                          <div className="mt-3 flex items-center justify-between text-[10px]">
                            <div className="font-mono text-zinc-500">
                              {variant.dimensions.width}×{variant.dimensions.depth}×{variant.dimensions.height} mm
                            </div>
                            <div className="text-emerald-400/90">{variant.leadTime}</div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Custom Size Controls */}
              {mode === 'custom' && (
                <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
                  <div className="mb-4 flex items-start justify-between">
                    <div>
                      <div className="text-sm font-medium tracking-widest text-zinc-400">CUSTOM SIZE</div>
                      <div className="text-xs text-zinc-500">
                        {useLiveOnshape ? 'Live Onshape geometry • Made to order' : 'Fast GLTF preview • Made to order'}
                      </div>
                    </div>
                    {useLiveOnshape ? (
                      <button
                        onClick={() => setUseLiveOnshape(false)}
                        className="text-[10px] text-zinc-500 hover:text-zinc-300 underline underline-offset-2"
                      >
                        Fast only
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setUseLiveOnshape(true)
                          fetchOnshapeGeometry(customDimensions)
                        }}
                        className="text-[10px] text-emerald-500 hover:text-emerald-400 underline underline-offset-2"
                      >
                        Try live Onshape
                      </button>
                    )}
                  </div>

                  <div className="space-y-5">
                    {(['width', 'depth', 'height'] as const).map((key) => {
                      const label = key === 'width' ? 'Width' : key === 'depth' ? 'Depth' : 'Height'
                      const value = customDimensions[key]
                      const range = CUSTOM_RANGES[key]

                      return (
                        <div key={key}>
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="text-sm font-medium text-white">{label}</div>
                            <div className="font-mono text-sm tabular-nums text-white">{value.toFixed(2)} in</div>
                          </div>
                          <div className="flex items-center gap-3">
                            <input
                              type="range"
                              min={range.min}
                              max={range.max}
                              step={range.step}
                              value={value}
                              onChange={(e) => updateDimension(key, parseFloat(e.target.value))}
                              className="flex-1 accent-white"
                            />
                            <input
                              type="number"
                              min={range.min}
                              max={range.max}
                              step={range.step}
                              value={value}
                              onChange={(e) =>
                                updateDimension(
                                  key,
                                  Math.max(range.min, Math.min(range.max, parseFloat(e.target.value) || range.min))
                                )
                              }
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
                    Live Onshape preview (2–10 in). Dimensions update the preview after a short pause.
                  </div>
                </div>
              )}

              {/* Selected / Summary Card */}
              <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
                <div className="mb-4">
                  <div className="text-xs tracking-[1.5px] text-zinc-500">SELECTED</div>
                  <div className="text-2xl font-semibold tracking-tight text-white">{activeVariant.name}</div>
                </div>
                <div className="mb-6 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                  <div>
                    <div className="text-[10px] text-zinc-500">EXTERNAL</div>
                    <div className="font-mono text-white">
                      {mode === 'custom'
                        ? `${activeVariant.dimensions.width.toFixed(2)} × ${activeVariant.dimensions.depth.toFixed(2)} × ${activeVariant.dimensions.height.toFixed(2)} in`
                        : `${activeVariant.dimensions.width} × ${activeVariant.dimensions.depth} × ${activeVariant.dimensions.height} mm`}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-zinc-500">MATERIAL / FINISH</div>
                    <div className="text-white">{activeVariant.material}<br />{activeVariant.finish}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-zinc-500">EST. WEIGHT</div>
                    <div className="text-white">{activeVariant.estWeight}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-zinc-500">LEAD TIME</div>
                    <div className="font-medium text-emerald-400">{activeVariant.leadTime}</div>
                  </div>
                </div>
                <div className="mb-6 rounded-2xl bg-zinc-900/60 p-4 text-sm text-zinc-300">
                  <span className="font-medium text-white">Best for:</span> {activeVariant.useCase}
                </div>
                <div className="space-y-3">
                  <button
                    onClick={openPurchase}
                    className="flex w-full items-center justify-center gap-3 rounded-2xl bg-white py-4 text-sm font-semibold text-black transition active:bg-zinc-200"
                  >
                    <ShoppingCart className="h-4 w-4" /> BUY NOW — ${activeVariant.price || 'Quote'}
                  </button>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => handleDownloadSTEP(activeVariant)}
                      className="flex items-center justify-center gap-2 rounded-2xl border border-zinc-700 py-3.5 text-sm font-medium text-white transition hover:bg-zinc-900 active:bg-zinc-950"
                    >
                      <Download className="h-4 w-4" /> DOWNLOAD STEP
                    </button>
                  </div>
                </div>
                <p className="mt-4 text-center text-[10px] text-zinc-500">
                  Prices in USD • Volume discounts available • Made in USA
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <PurchaseModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} variant={activeVariant} mode={modalMode} />
    </div>
  )
}
