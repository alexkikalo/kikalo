'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { ThreeDViewer } from './ThreeDViewer'
import { StaticCaseViewer } from './StaticCaseViewer'
import { OnshapeGeometry } from './OnshapeGeometry'
import { PurchaseModal } from './PurchaseModal'
import { variants, getVariantById, defaultVariantId, type NovaShellVariant } from '@/lib/variants'
import { Download, ShoppingCart, Star, Plus, Trash2, RotateCw, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Box } from 'lucide-react'

// Default custom dimensions in inches (inside Onshape config ranges)
const DEFAULT_CUSTOM_DIMS = { width: 4.72, depth: 3.74, height: 2.0 }

// UI ranges — kept in sync with Onshape configuration variables
// Onshape now: all axes min 2 in / max 10 in
const CUSTOM_RANGES = {
  width:  { min: 2.0, max: 10.0, step: 0.01 },
  depth:  { min: 2.0, max: 10.0, step: 0.01 },
  height: { min: 2.0, max: 10.0, step: 0.01 },
}

// Port position ranges (match Onshape Front_HDMI_01_X / Y limits)
const PORT_POS_RANGE = { min: -10, max: 10, step: 0.01 }

const DEBOUNCE_MS = 450

// Common connector / cutout options for the front port plate
const PORT_TYPES = [
  { id: 'usb-c', label: 'USB-C' },
  { id: 'usb-a', label: 'USB-A' },
  { id: 'hdmi', label: 'HDMI' },
  { id: 'ethernet', label: 'Ethernet (RJ45)' },
  { id: 'microsd', label: 'microSD' },
  { id: 'dc-barrel', label: 'DC Barrel Jack' },
  { id: 'sma', label: 'SMA / Antenna' },
  { id: 'gpio', label: 'GPIO / Header' },
  { id: '3.5mm', label: '3.5 mm Audio' },
  { id: 'blank', label: 'Blank / Custom Cutout' },
] as const

type PortTypeId = (typeof PORT_TYPES)[number]['id']

type Port = {
  id: string
  type: PortTypeId
  /** Horizontal offset from center of front face (inches). Positive = right */
  x: number
  /** Vertical offset from center of front face (inches). Positive = up */
  y: number
  /** Rotation in degrees (0, 90, 180, 270) */
  rotation: 0 | 90 | 180 | 270
}

const createPortId = () => `port-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`

export function NovaShellConfigurator() {
  const [selectedId, setSelectedId] = useState(defaultVariantId)
  const [mode, setMode] = useState<'preset' | 'custom'>('preset')
  const [customDimensions, setCustomDimensions] = useState(DEFAULT_CUSTOM_DIMS)
  const [modalMode, setModalMode] = useState<'purchase' | 'quote'>('purchase')
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Front face ports — first HDMI port drives Onshape Front_HDMI_01
  const [ports, setPorts] = useState<Port[]>([])

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

  const fetchOnshapeGeometry = useCallback(async (dims: typeof DEFAULT_CUSTOM_DIMS, currentPorts: Port[]) => {
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

      // Map first HDMI port to Onshape Front_HDMI_01 parameters
      const hdmiPort = currentPorts.find((p) => p.type === 'hdmi')
      if (hdmiPort) {
        params.set('hdmi', 'true')
        params.set('hdmiX', hdmiPort.x.toFixed(3))
        params.set('hdmiY', hdmiPort.y.toFixed(3))
      } else {
        params.set('hdmi', 'false')
      }

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

  // Debounced fetch on dimension / ports / mode change
  useEffect(() => {
    if (mode !== 'custom' || !useLiveOnshape) return

    if (debounceRef.current) clearTimeout(debounceRef.current)

    debounceRef.current = setTimeout(() => {
      fetchOnshapeGeometry(customDimensions, ports)
    }, DEBOUNCE_MS)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [customDimensions, ports, mode, useLiveOnshape, fetchOnshapeGeometry])

  // Initial fetch when entering custom
  useEffect(() => {
    if (mode === 'custom' && useLiveOnshape && !onshapeData && !onshapeLoading) {
      fetchOnshapeGeometry(customDimensions, ports)
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

  // --- Port helpers ---
  const addPort = () => {
    setPorts(prev => [
      ...prev,
      {
        id: createPortId(),
        type: 'usb-c',
        x: 0,
        y: 0,
        rotation: 0,
      },
    ])
  }

  const removePort = (id: string) => {
    setPorts(prev => prev.filter(p => p.id !== id))
  }

  const updatePort = (id: string, patch: Partial<Port>) => {
    setPorts(prev => prev.map(p => (p.id === id ? { ...p, ...patch } : p)))
  }

  const movePort = (id: string, dx: number, dy: number) => {
    setPorts(prev =>
      prev.map(p =>
        p.id === id
          ? {
              ...p,
              x: Math.round(Math.max(PORT_POS_RANGE.min, Math.min(PORT_POS_RANGE.max, p.x + dx)) * 100) / 100,
              y: Math.round(Math.max(PORT_POS_RANGE.min, Math.min(PORT_POS_RANGE.max, p.y + dy)) * 100) / 100,
            }
          : p
      )
    )
  }

  const setPortCoord = (id: string, axis: 'x' | 'y', raw: string) => {
    const parsed = parseFloat(raw)
    if (isNaN(parsed)) return
    const clamped = Math.max(PORT_POS_RANGE.min, Math.min(PORT_POS_RANGE.max, parsed))
    const rounded = Math.round(clamped * 100) / 100
    updatePort(id, { [axis]: rounded })
  }

  const rotatePort = (id: string) => {
    setPorts(prev =>
      prev.map(p =>
        p.id === id
          ? {
              ...p,
              rotation: ((p.rotation + 90) % 360) as 0 | 90 | 180 | 270,
            }
          : p
      )
    )
  }

  const openPurchase = () => {
    setModalMode('purchase')
    setIsModalOpen(true)
  }

  const handleDownloadSTEP = (variant: NovaShellVariant) => {
    const content = `ISO-10303-21;
HEADER;
FILE_DESCRIPTION(('NovaShell ${variant.name} STEP export placeholder'),'2;1');
FILE_NAME='${variant.stepFileName}','${new Date().toISOString()}',('Kikalo Engineering'),('NovaShell by Kikalo.net'),'','SolidWorks / Onshape export','');
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
      <div id="configurator" className="mx-auto max-w-7xl px-6 pb-8">
        {/* Header - PREP style with mode toggle on the right */}
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-zinc-800 p-3">
              <Box className="h-7 w-7 text-white" />
            </div>
            <div>
              <div className="text-3xl font-semibold tracking-tighter">NovaShell</div>
              <div className="text-sm text-zinc-400">Premium custom aluminum enclosures • Made in North Texas</div>
            </div>
          </div>

          {/* Preset / Custom Toggle - same structure and width behavior as PREP */}
          <div className="mt-4 lg:mt-0 flex rounded-2xl border border-zinc-800 bg-zinc-950 p-1 self-start lg:self-auto lg:w-[280px]">
            <button
              onClick={switchToPreset}
              className={`flex-1 rounded-xl px-5 py-2 text-sm font-medium transition ${mode === 'preset' ? 'bg-white text-black shadow' : 'text-zinc-400 hover:text-white'}`}
            >
              Preset Sizes
            </button>
            <button
              onClick={switchToCustom}
              className={`flex-1 rounded-xl px-5 py-2 text-sm font-medium transition ${mode === 'custom' ? 'bg-white text-black shadow' : 'text-zinc-400 hover:text-white'}`}
            >
              Custom Size
            </button>
          </div>
        </div>

        {/* Equal height columns */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.5fr,1.25fr,1.25fr] lg:gap-10 items-stretch">
          {/* Preview column */}
          <div className="lg:col-span-1 h-full">
            <div className="relative h-full w-full overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950 shadow-2xl max-h-[520px]">
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

            {/* Debug error */}
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

          {/* Controls column */}
          <div className="lg:col-span-1 h-full">
            <div className="sticky top-6 h-full max-h-[520px] overflow-y-auto space-y-6 pr-1
              [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-zinc-700
              [&::-webkit-scrollbar-track]:bg-zinc-900">
              {/* Preset Sizes */}
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
                <>
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
                            fetchOnshapeGeometry(customDimensions, ports)
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

                  {/* FRONT PORTS */}
                  <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-medium tracking-widest text-zinc-400">FRONT PORTS</div>
                        <div className="text-xs text-zinc-500">
                          First HDMI port is live in Onshape (Front_HDMI_01). Other ports coming soon.
                        </div>
                      </div>
                      <button
                        onClick={addPort}
                        className="flex shrink-0 items-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs font-medium text-white transition hover:border-zinc-500 hover:bg-zinc-800 active:scale-[0.98]"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Add Port
                      </button>
                    </div>

                    {ports.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/40 px-4 py-8 text-center">
                        <div className="text-sm text-zinc-500">No ports yet</div>
                        <div className="mt-1 text-[11px] text-zinc-600">
                          Click “Add Port” and set type to HDMI to see the live cutout.
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {ports.map((port, index) => {
                          const typeLabel = PORT_TYPES.find(t => t.id === port.type)?.label || port.type
                          const isLiveHdmi = port.type === 'hdmi' && ports.findIndex(p => p.type === 'hdmi') === index
                          return (
                            <div
                              key={port.id}
                              className={`rounded-2xl border p-4 ${
                                isLiveHdmi
                                  ? 'border-emerald-500/40 bg-emerald-500/5'
                                  : 'border-zinc-800 bg-zinc-900/60'
                              }`}
                            >
                              <div className="mb-3 flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-800 text-[10px] font-medium text-zinc-400">
                                    {index + 1}
                                  </span>
                                  <select
                                    value={port.type}
                                    onChange={(e) => updatePort(port.id, { type: e.target.value as PortTypeId })}
                                    className="rounded-lg border border-zinc-700 bg-zinc-950 px-2.5 py-1.5 text-sm text-white focus:border-white/50 focus:outline-none"
                                  >
                                    {PORT_TYPES.map(t => (
                                      <option key={t.id} value={t.id}>
                                        {t.label}
                                      </option>
                                    ))}
                                  </select>
                                  {isLiveHdmi && (
                                    <span className="rounded bg-emerald-500/15 px-1.5 py-0.5 text-[9px] font-medium text-emerald-400">
                                      LIVE
                                    </span>
                                  )}
                                </div>
                                <button
                                  onClick={() => removePort(port.id)}
                                  className="rounded-lg p-1.5 text-zinc-500 transition hover:bg-zinc-800 hover:text-red-400"
                                  title="Remove port"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                {/* Position */}
                                <div>
                                  <div className="mb-1.5 text-[10px] tracking-wider text-zinc-500">POSITION</div>
                                  <div className="flex flex-col gap-2">
                                    {/* X row */}
                                    <div className="flex items-center gap-1.5">
                                      <button
                                        onClick={() => movePort(port.id, -0.1, 0)}
                                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-950 text-zinc-400 transition hover:border-zinc-500 hover:text-white"
                                        title="Move left"
                                      >
                                        <ArrowLeft className="h-3.5 w-3.5" />
                                      </button>
                                      <button
                                        onClick={() => movePort(port.id, 0.1, 0)}
                                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-950 text-zinc-400 transition hover:border-zinc-500 hover:text-white"
                                        title="Move right"
                                      >
                                        <ArrowRight className="h-3.5 w-3.5" />
                                      </button>
                                      <span className="text-[10px] text-zinc-500 w-3">X</span>
                                      <input
                                        type="number"
                                        min={PORT_POS_RANGE.min}
                                        max={PORT_POS_RANGE.max}
                                        step={PORT_POS_RANGE.step}
                                        value={port.x}
                                        onChange={(e) => setPortCoord(port.id, 'x', e.target.value)}
                                        className="w-16 rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-right font-mono text-xs text-white focus:border-white/60 focus:outline-none"
                                      />
                                    </div>
                                    {/* Y row */}
                                    <div className="flex items-center gap-1.5">
                                      <button
                                        onClick={() => movePort(port.id, 0, 0.1)}
                                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-950 text-zinc-400 transition hover:border-zinc-500 hover:text-white"
                                        title="Move up"
                                      >
                                        <ArrowUp className="h-3.5 w-3.5" />
                                      </button>
                                      <button
                                        onClick={() => movePort(port.id, 0, -0.1)}
                                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-950 text-zinc-400 transition hover:border-zinc-500 hover:text-white"
                                        title="Move down"
                                      >
                                        <ArrowDown className="h-3.5 w-3.5" />
                                      </button>
                                      <span className="text-[10px] text-zinc-500 w-3">Y</span>
                                      <input
                                        type="number"
                                        min={PORT_POS_RANGE.min}
                                        max={PORT_POS_RANGE.max}
                                        step={PORT_POS_RANGE.step}
                                        value={port.y}
                                        onChange={(e) => setPortCoord(port.id, 'y', e.target.value)}
                                        className="w-16 rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-right font-mono text-xs text-white focus:border-white/60 focus:outline-none"
                                      />
                                    </div>
                                  </div>
                                </div>

                                {/* Rotation */}
                                <div>
                                  <div className="mb-1.5 text-[10px] tracking-wider text-zinc-500">ROTATION</div>
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => rotatePort(port.id)}
                                      className="flex h-9 items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-950 px-3 text-sm text-white transition hover:border-zinc-500 hover:bg-zinc-900 active:scale-[0.98]"
                                    >
                                      <RotateCw className="h-3.5 w-3.5" />
                                      {port.rotation}°
                                    </button>
                                  </div>
                                  <div className="mt-1.5 text-[10px] text-zinc-600">
                                    Click to rotate 90°
                                  </div>
                                </div>
                              </div>

                              <div className="mt-3 border-t border-zinc-800 pt-2 text-[10px] text-zinc-600">
                                {typeLabel} · X {port.x.toFixed(2)} in · Y {port.y.toFixed(2)} in · {port.rotation}°
                                {isLiveHdmi && ' · driving Front_HDMI_01'}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}

                    {ports.length > 0 && (
                      <div className="mt-4 text-[10px] text-zinc-500">
                        Positions are relative to center of front face (−10 to +10 in). The first HDMI port updates the live Onshape cutout.
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Checkout column */}
          <div className="lg:col-span-1 h-full">
            <div className="sticky top-6 h-full max-h-[520px] overflow-y-auto
              [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-zinc-700
              [&::-webkit-scrollbar-track]:bg-zinc-900">
              <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
                <div className="mb-4">
                  <div className="text-xs tracking-[1.5px] text-zinc-500">SELECTED</div>
                  <div className="text-2xl font-semibold tracking-tight text-white">{activeVariant.name}</div>
                </div>
                <div className="mb-6 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                  <div>
                    <div className="text-[10px] text-zinc-500 whitespace-nowrap">EXTERNAL</div>
                    <div className="font-mono text-white">
                      {mode === 'custom'
                        ? `${activeVariant.dimensions.width.toFixed(2)} × ${activeVariant.dimensions.depth.toFixed(2)} × ${activeVariant.dimensions.height.toFixed(2)} in`
                        : `${activeVariant.dimensions.width} × ${activeVariant.dimensions.depth} × ${activeVariant.dimensions.height} mm`}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-zinc-500 whitespace-nowrap">MATERIAL / FINISH</div>
                    <div className="text-white">{activeVariant.material}<br />{activeVariant.finish}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-zinc-500 whitespace-nowrap">EST. WEIGHT</div>
                    <div className="text-white">{activeVariant.estWeight}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-zinc-500 whitespace-nowrap">LEAD TIME</div>
                    <div className="font-medium text-emerald-400">{activeVariant.leadTime}</div>
                  </div>
                </div>

                {mode === 'custom' && ports.length > 0 && (
                  <div className="mb-6 rounded-2xl bg-zinc-900/60 p-4">
                    <div className="mb-2 text-[10px] tracking-wider text-zinc-500">FRONT PORTS ({ports.length})</div>
                    <div className="space-y-1 text-sm text-zinc-300">
                      {ports.map((p, i) => (
                        <div key={p.id} className="flex justify-between gap-2">
                          <span>
                            {i + 1}. {PORT_TYPES.find(t => t.id === p.type)?.label || p.type}
                            {p.type === 'hdmi' && ports.findIndex(x => x.type === 'hdmi') === i && (
                              <span className="ml-1.5 text-[9px] text-emerald-400">LIVE</span>
                            )}
                          </span>
                          <span className="font-mono text-[11px] text-zinc-500">
                            {p.rotation}° · ({p.x >= 0 ? '+' : ''}{p.x.toFixed(1)}, {p.y >= 0 ? '+' : ''}{p.y.toFixed(1)})
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

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
