'use client'

import { useState } from 'react'
import { Plus, Trash2, Download, FileText, AlertTriangle, Target } from 'lucide-react'

// Types for FMEA data model
type FailureMode = {
  id: string
  mode: string
  effect: string
  severity: number
  occurrence: number
  detection: number
  controls: string
  actions: string
}

type FMEAItem = {
  id: string
  name: string
  failureModes: FailureMode[]
}

// Helper to create new failure mode
const createFailureMode = (): FailureMode => ({
  id: `fm-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  mode: '',
  effect: '',
  severity: 5,
  occurrence: 3,
  detection: 5,
  controls: '',
  actions: '',
})

// Helper to calculate RPN
const calculateRPN = (fm: FailureMode) => fm.severity * fm.occurrence * fm.detection

// Helper to get risk level
const getRiskLevel = (rpn: number) => {
  if (rpn >= 100) return { label: 'High', color: 'text-red-400 bg-red-500/10 border-red-500/30' }
  if (rpn >= 50) return { label: 'Medium', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' }
  return { label: 'Low', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' }
}

export function PREPConfigurator() {
  // New top-level mode: Design FMEA or Process FMEA
  const [fmeaType, setFmeaType] = useState<'design' | 'process'>('design')

  const [items, setItems] = useState<FMEAItem[]>([
    {
      id: 'item-1',
      name: 'Housing / Enclosure',
      failureModes: [],
    },
  ])

  const [selectedItemId, setSelectedItemId] = useState<string>('item-1')
  const [selectedFailureModeId, setSelectedFailureModeId] = useState<string | null>(null)

  const selectedItem = items.find(i => i.id === selectedItemId) || items[0]
  const selectedFailureMode = selectedItem?.failureModes.find(fm => fm.id === selectedFailureModeId) || null

  // Switch between Design and Process FMEA (resets items for clean separation)
  const switchFmeaType = (newType: 'design' | 'process') => {
    if (newType === fmeaType) return

    const confirmSwitch = window.confirm(
      `Switch to ${newType === 'design' ? 'Design FMEA (DFMEA)' : 'Process FMEA (PFMEA)'}?\n\nThis will clear the current items and start fresh.`
    )

    if (!confirmSwitch) return

    setFmeaType(newType)

    // Reset with appropriate starting item
    const defaultName = newType === 'design' ? 'Housing / Enclosure' : 'Assembly / Soldering'
    const newItem: FMEAItem = {
      id: 'item-1',
      name: defaultName,
      failureModes: [],
    }
    setItems([newItem])
    setSelectedItemId(newItem.id)
    setSelectedFailureModeId(null)
  }

  // Add new item (context-aware based on current FMEA type)
  const addItem = () => {
    const defaultName = fmeaType === 'design' ? 'New Component' : 'New Process Step'
    const newItem: FMEAItem = {
      id: `item-${Date.now()}`,
      name: defaultName,
      failureModes: [],
    }
    setItems(prev => [...prev, newItem])
    setSelectedItemId(newItem.id)
    setSelectedFailureModeId(null)
  }

  // Update item name
  const updateItemName = (id: string, name: string) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, name } : item
    ))
  }

  // Delete item
  const deleteItem = (id: string) => {
    if (items.length === 1) return
    setItems(prev => prev.filter(item => item.id !== id))
    if (selectedItemId === id) {
      setSelectedItemId(items[0].id)
      setSelectedFailureModeId(null)
    }
  }

  // Add failure mode to selected item
  const addFailureMode = () => {
    if (!selectedItem) return

    const newFM = createFailureMode()
    setItems(prev => prev.map(item => 
      item.id === selectedItem.id 
        ? { ...item, failureModes: [...item.failureModes, newFM] }
        : item
    ))
    setSelectedFailureModeId(newFM.id)
  }

  // Update a failure mode field
  const updateFailureMode = (itemId: string, fmId: string, field: keyof FailureMode, value: string | number) => {
    setItems(prev => prev.map(item => {
      if (item.id !== itemId) return item
      return {
        ...item,
        failureModes: item.failureModes.map(fm => 
          fm.id === fmId ? { ...fm, [field]: value } : fm
        )
      }
    }))
  }

  // Delete failure mode
  const deleteFailureMode = (itemId: string, fmId: string) => {
    setItems(prev => prev.map(item => {
      if (item.id !== itemId) return item
      return {
        ...item,
        failureModes: item.failureModes.filter(fm => fm.id !== fmId)
      }
    }))
    if (selectedFailureModeId === fmId) {
      setSelectedFailureModeId(null)
    }
  }

  // Get all failure modes across all items (for summary)
  const allFailureModes = items.flatMap(item => 
    item.failureModes.map(fm => ({ ...fm, itemName: item.name }))
  )

  const totalRPNs = allFailureModes.length
  const highRiskCount = allFailureModes.filter(fm => calculateRPN(fm) >= 100).length

  // Export functions (placeholder for now)
  const exportToPDF = () => {
    alert('PDF export coming soon — will generate professional FMEA report')
  }

  const exportToVDA = () => {
    alert('VDA / AIAG export coming soon — will generate compliant spreadsheet')
  }

  const isDesign = fmeaType === 'design'

  return (
    <div className="w-full">
      <div className="mx-auto max-w-7xl px-6 pb-12">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-500/10 p-2">
              <Target className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <div className="text-3xl font-semibold tracking-tighter">PREP Configurator</div>
              <div className="text-sm text-zinc-400">Product Risk Evaluation & Prevention — America's FMEA</div>
            </div>
          </div>

          {/* Design vs Process Toggle */}
          <div className="flex rounded-2xl border border-zinc-800 bg-zinc-950 p-1 self-start lg:self-auto">
            <button
              onClick={() => switchFmeaType('design')}
              className={`flex-1 rounded-xl px-5 py-2 text-sm font-medium transition ${isDesign 
                ? 'bg-white text-black shadow' 
                : 'text-zinc-400 hover:text-white'}`}
            >
              Design FMEA (DFMEA)
            </button>
            <button
              onClick={() => switchFmeaType('process')}
              className={`flex-1 rounded-xl px-5 py-2 text-sm font-medium transition ${!isDesign 
                ? 'bg-white text-black shadow' 
                : 'text-zinc-400 hover:text-white'}`}
            >
              Process FMEA (PFMEA)
            </button>
          </div>
        </div>

        {/* 3-Column Layout */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr,1.3fr,1.3fr] lg:gap-8 items-start">
          
          {/* COLUMN 1: Items / Structure List */}
          <div className="lg:sticky lg:top-6">
            <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium tracking-widest text-zinc-400">STRUCTURE</div>
                  <div className="text-xs text-zinc-500">
                    {isDesign ? 'Components & Subsystems' : 'Process Steps & Operations'}
                  </div>
                </div>
                <button
                  onClick={addItem}
                  className="flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white transition hover:border-zinc-500 hover:bg-zinc-800 active:scale-[0.98]"
                >
                  <Plus className="h-3.5 w-3.5" /> {isDesign ? 'Add Component' : 'Add Process Step'}
                </button>
              </div>

              <div className="max-h-[520px] space-y-2 overflow-y-auto pr-1
                [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-zinc-700">
                {items.map((item) => {
                  const isSelected = item.id === selectedItemId
                  const itemRPNs = item.failureModes.map(calculateRPN)
                  const maxRPN = itemRPNs.length > 0 ? Math.max(...itemRPNs) : 0
                  const risk = getRiskLevel(maxRPN)

                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setSelectedItemId(item.id)
                        setSelectedFailureModeId(null)
                      }}
                      className={`group w-full rounded-2xl border p-4 text-left transition-all active:scale-[0.985] ${isSelected 
                        ? 'border-blue-500/60 bg-zinc-900 shadow-xl' 
                        : 'border-zinc-800 bg-zinc-950 hover:border-zinc-700 hover:bg-zinc-900/70'}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-white">
                            <input
                              value={item.name}
                              onChange={(e) => {
                                e.stopPropagation()
                                updateItemName(item.id, e.target.value)
                              }}
                              onClick={(e) => e.stopPropagation()}
                              className="w-full bg-transparent outline-none focus:underline"
                            />
                          </div>
                          <div className="mt-1 text-xs text-zinc-500">
                            {item.failureModes.length} failure mode{item.failureModes.length !== 1 ? 's' : ''}
                          </div>
                        </div>

                        {maxRPN > 0 && (
                          <div className={`rounded-lg border px-2 py-0.5 text-center text-[10px] font-mono tabular-nums ${risk.color}`}>
                            {maxRPN}
                          </div>
                        )}

                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteItem(item.id)
                          }}
                          className="rounded p-1 text-zinc-500 opacity-0 transition hover:bg-zinc-800 hover:text-red-400 group-hover:opacity-100"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </button>
                  )
                })}
              </div>

              <div className="mt-4 text-[10px] text-zinc-500">
                {isDesign 
                  ? 'Add components or subsystems you are designing. Click any item to analyze its failure modes.'
                  : 'Add process steps or operations. Click any step to analyze its failure modes.'}
              </div>
            </div>
          </div>

          {/* COLUMN 2: Entry Form */}
          <div className="lg:sticky lg:top-6">
            <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium tracking-widest text-zinc-400">FAILURE MODE ENTRY</div>
                  <div className="text-xs text-zinc-500">{selectedItem?.name}</div>
                </div>
                <button
                  onClick={addFailureMode}
                  disabled={!selectedItem}
                  className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-medium text-white transition hover:bg-blue-500 active:scale-[0.98] disabled:opacity-50"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Failure Mode
                </button>
              </div>

              {!selectedFailureMode ? (
                <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/40 px-6 py-12 text-center">
                  <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800">
                    <AlertTriangle className="h-5 w-5 text-zinc-400" />
                  </div>
                  <div className="text-sm text-zinc-400">No failure mode selected</div>
                  <div className="mt-1 text-xs text-zinc-500">Add a failure mode using the button above</div>
                </div>
              ) : (
                <div className="space-y-5">
                  {/* Failure Mode */}
                  <div>
                    <label className="mb-1.5 block text-xs tracking-wider text-zinc-400">FAILURE MODE</label>
                    <input
                      value={selectedFailureMode.mode}
                      onChange={(e) => updateFailureMode(selectedItem.id, selectedFailureMode.id, 'mode', e.target.value)}
                      placeholder={isDesign ? "e.g. Cracking under vibration" : "e.g. Insufficient solder paste"}
                      className="w-full rounded-2xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-white placeholder:text-zinc-500 focus:border-blue-500/60 focus:outline-none"
                    />
                  </div>

                  {/* Effect */}
                  <div>
                    <label className="mb-1.5 block text-xs tracking-wider text-zinc-400">POTENTIAL EFFECT(S)</label>
                    <textarea
                      value={selectedFailureMode.effect}
                      onChange={(e) => updateFailureMode(selectedItem.id, selectedFailureMode.id, 'effect', e.target.value)}
                      placeholder={isDesign ? "e.g. Loss of environmental seal" : "e.g. Weak joint, electrical failure"}
                      rows={2}
                      className="w-full resize-y rounded-2xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-white placeholder:text-zinc-500 focus:border-blue-500/60 focus:outline-none"
                    />
                  </div>

                  {/* S / O / D Scoring */}
                  <div className="grid grid-cols-3 gap-4">
                    {(['severity', 'occurrence', 'detection'] as const).map((key) => {
                      const label = key === 'severity' ? 'Severity (S)' : key === 'occurrence' ? 'Occurrence (O)' : 'Detection (D)'
                      const value = selectedFailureMode[key]
                      return (
                        <div key={key}>
                          <div className="mb-1.5 flex items-baseline justify-between">
                            <label className="text-xs tracking-wider text-zinc-400">{label}</label>
                            <span className="font-mono text-lg font-semibold text-white tabular-nums">{value}</span>
                          </div>
                          <input
                            type="range"
                            min="1"
                            max="10"
                            step="1"
                            value={value}
                            onChange={(e) => updateFailureMode(selectedItem.id, selectedFailureMode.id, key, parseInt(e.target.value))}
                            className="w-full accent-blue-500"
                          />
                          <div className="mt-1 flex justify-between text-[10px] text-zinc-500">
                            <div>1</div><div>10</div>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* RPN Display */}
                  <div className="rounded-2xl bg-zinc-900 p-4">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-zinc-400">Risk Priority Number (RPN)</div>
                      <div className="font-mono text-3xl font-semibold text-white tabular-nums">
                        {calculateRPN(selectedFailureMode)}
                      </div>
                    </div>
                    <div className={`mt-2 inline-block rounded-lg border px-3 py-0.5 text-xs font-medium ${getRiskLevel(calculateRPN(selectedFailureMode)).color}`}>
                      {getRiskLevel(calculateRPN(selectedFailureMode)).label} Risk
                    </div>
                  </div>

                  {/* Current Controls */}
                  <div>
                    <label className="mb-1.5 block text-xs tracking-wider text-zinc-400">CURRENT CONTROLS / PREVENTION</label>
                    <textarea
                      value={selectedFailureMode.controls}
                      onChange={(e) => updateFailureMode(selectedItem.id, selectedFailureMode.id, 'controls', e.target.value)}
                      placeholder={isDesign ? "Design features, material specs, tolerances..." : "Process controls, inspection steps, fixtures..."}
                      rows={2}
                      className="w-full resize-y rounded-2xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-white placeholder:text-zinc-500 focus:border-blue-500/60 focus:outline-none"
                    />
                  </div>

                  {/* Recommended Actions */}
                  <div>
                    <label className="mb-1.5 block text-xs tracking-wider text-zinc-400">RECOMMENDED ACTIONS</label>
                    <textarea
                      value={selectedFailureMode.actions}
                      onChange={(e) => updateFailureMode(selectedItem.id, selectedFailureMode.id, 'actions', e.target.value)}
                      placeholder={isDesign ? "Design changes, material selection, geometry updates..." : "Process changes, tooling, training, poka-yoke..."}
                      rows={2}
                      className="w-full resize-y rounded-2xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-white placeholder:text-zinc-500 focus:border-blue-500/60 focus:outline-none"
                    />
                  </div>

                  <button
                    onClick={() => deleteFailureMode(selectedItem.id, selectedFailureMode.id)}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-500/30 py-3 text-sm font-medium text-red-400 transition hover:bg-red-500/10 active:bg-red-500/20"
                  >
                    <Trash2 className="h-4 w-4" /> Delete This Failure Mode
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* COLUMN 3: Summary / Checkout */}
          <div className="lg:sticky lg:top-6">
            <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
              <div className="mb-5">
                <div className="text-sm font-medium tracking-widest text-zinc-400">RISK SUMMARY</div>
              </div>

              {/* Stats */}
              <div className="mb-6 grid grid-cols-3 gap-3 text-center">
                <div className="rounded-2xl bg-zinc-900 p-3">
                  <div className="text-xs text-zinc-500">ITEMS</div>
                  <div className="text-2xl font-semibold text-white tabular-nums">{items.length}</div>
                </div>
                <div className="rounded-2xl bg-zinc-900 p-3">
                  <div className="text-xs text-zinc-500">FAILURE MODES</div>
                  <div className="text-2xl font-semibold text-white tabular-nums">{totalRPNs}</div>
                </div>
                <div className="rounded-2xl bg-zinc-900 p-3">
                  <div className="text-xs text-zinc-500">HIGH RISK</div>
                  <div className={`text-2xl font-semibold tabular-nums ${highRiskCount > 0 ? 'text-red-400' : 'text-white'}`}>{highRiskCount}</div>
                </div>
              </div>

              {/* All Failure Modes List */}
              <div className="mb-4 text-xs tracking-wider text-zinc-400">ALL FAILURE MODES ({totalRPNs})</div>
              
              {allFailureModes.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/40 px-4 py-8 text-center text-xs text-zinc-500">
                  No failure modes yet.
                </div>
              ) : (
                <div className="max-h-[280px] space-y-2 overflow-y-auto pr-1 text-sm
                  [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-zinc-700">
                  {allFailureModes
                    .sort((a, b) => calculateRPN(b) - calculateRPN(a))
                    .map((fm) => {
                      const rpn = calculateRPN(fm)
                      const risk = getRiskLevel(rpn)
                      return (
                        <div key={fm.id} className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-3">
                          <div className="min-w-0 flex-1 pr-3">
                            <div className="font-medium text-white truncate">{fm.mode || 'Untitled failure mode'}</div>
                            <div className="text-[10px] text-zinc-500 truncate">{fm.itemName}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-mono text-lg font-semibold tabular-nums text-white">{rpn}</div>
                            <div className={`text-[10px] ${risk.color.split(' ')[0]}`}>{risk.label}</div>
                          </div>
                        </div>
                      )
                    })}
                </div>
              )}

              {/* Export Actions */}
              <div className="mt-6 space-y-3 border-t border-zinc-800 pt-6">
                <button
                  onClick={exportToPDF}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white py-3.5 text-sm font-semibold text-black transition active:bg-zinc-200"
                >
                  <Download className="h-4 w-4" /> Export PDF Report
                </button>
                <button
                  onClick={exportToVDA}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl border border-blue-500/40 bg-blue-500/5 py-3.5 text-sm font-medium text-blue-400 transition hover:bg-blue-500/10 active:bg-blue-500/15"
                >
                  <FileText className="h-4 w-4" /> Export VDA / AIAG Format (Paid)
                </button>

                <p className="pt-2 text-center text-[10px] text-zinc-500">
                  Free format included • VDA & professional exports require paid plan
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-xs text-zinc-500">
          Working prototype • {isDesign ? 'Design FMEA' : 'Process FMEA'} mode • Data saved in this browser session
        </div>
      </div>
    </div>
  )
}
