'use client'

import { useState } from 'react'
import { X, CheckCircle, ArrowRight, Clock } from 'lucide-react'
import type { NovaShellVariant } from '@/lib/variants'
import { motion, AnimatePresence } from 'framer-motion'

interface PurchaseModalProps {
  isOpen: boolean
  onClose: () => void
  variant: NovaShellVariant
  mode?: 'purchase' | 'quote'
}

export function PurchaseModal({ isOpen, onClose, variant, mode = 'purchase' }: PurchaseModalProps) {
  const [quantity, setQuantity] = useState(1)
  const [formData, setFormData] = useState({ name: '', email: '', company: '', address: '', notes: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const isQuoteMode = mode === 'quote'
  const unitPrice = variant.price
  const total = unitPrice * quantity

  const resetForm = () => { setFormData({ name: '', email: '', company: '', address: '', notes: '' }); setQuantity(1); setIsSuccess(false); setIsSubmitting(false) }
  const handleClose = () => { resetForm(); onClose() }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.email) { alert('Please provide your name and email.'); return }
    setIsSubmitting(true)
    await new Promise(resolve => setTimeout(resolve, 850))
    const payload = { mode: isQuoteMode ? 'quote_request' : 'preconfigured_order', variantId: variant.id, variantName: variant.name, quantity: isQuoteMode ? undefined : quantity, unitPrice, total: isQuoteMode ? undefined : total, customer: formData, timestamp: new Date().toISOString() }
    console.log('%c[NovaShell] Form submission payload:', 'color:#3b82f6', payload)
    setIsSubmitting(false)
    setIsSuccess(true)
  }

  const updateField = (field: keyof typeof formData, value: string) => setFormData(prev => ({ ...prev, [field]: value }))

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4">
        <motion.div initial={{ opacity: 0, scale: 0.96, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 10 }} transition={{ type: 'spring', bounce: 0.02, duration: 0.2 }} className="w-full max-w-[520px] overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950 shadow-2xl">
          <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-5">
            <div>
              <div className="text-sm font-medium tracking-[1px] text-zinc-500">{isQuoteMode ? 'CUSTOM REQUEST' : 'PRECONFIGURED ORDER'}</div>
              <div className="text-xl font-semibold text-white">{variant.name}</div>
            </div>
            <button onClick={handleClose} className="rounded-full p-2 text-zinc-400 transition hover:bg-zinc-900 hover:text-white"><X className="h-5 w-5" /></button>
          </div>

          {!isSuccess ? (
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
                <div className="flex items-baseline justify-between">
                  <div>
                    <div className="text-sm text-zinc-400">Unit price</div>
                    <div className="text-3xl font-semibold tabular-nums tracking-tighter text-white">${unitPrice}</div>
                  </div>
                  {!isQuoteMode && <div className="text-right"><div className="text-xs text-zinc-500">LEAD TIME</div><div className="flex items-center gap-1.5 text-sm font-medium text-emerald-400"><Clock className="h-3.5 w-3.5" /> {variant.leadTime}</div></div>}
                </div>
                {!isQuoteMode && <div className="mt-4 flex items-center justify-between border-t border-zinc-800 pt-4"><div className="text-sm text-zinc-400">Quantity</div><div className="flex items-center gap-3"><button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))} className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-700 text-lg leading-none text-white active:bg-zinc-800">−</button><div className="w-8 text-center font-mono text-lg tabular-nums">{quantity}</div><button type="button" onClick={() => setQuantity(Math.min(50, quantity + 1))} className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-700 text-lg leading-none text-white active:bg-zinc-800">+</button></div><div className="text-right"><div className="text-xs text-zinc-500">TOTAL</div><div className="font-mono text-2xl font-semibold tabular-nums text-white">${total}</div></div></div>}
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div><label className="mb-1.5 block text-xs font-medium tracking-widest text-zinc-400">FULL NAME *</label><input type="text" required value={formData.name} onChange={(e) => updateField('name', e.target.value)} className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm placeholder:text-zinc-600 focus:border-zinc-600 focus:outline-none" placeholder="Alex Kikalo" /></div>
                  <div><label className="mb-1.5 block text-xs font-medium tracking-widest text-zinc-400">EMAIL *</label><input type="email" required value={formData.email} onChange={(e) => updateField('email', e.target.value)} className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm placeholder:text-zinc-600 focus:border-zinc-600 focus:outline-none" placeholder="you@company.com" /></div>
                </div>
                <div><label className="mb-1.5 block text-xs font-medium tracking-widest text-zinc-400">COMPANY / PROJECT (OPTIONAL)</label><input type="text" value={formData.company} onChange={(e) => updateField('company', e.target.value)} className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm placeholder:text-zinc-600 focus:border-zinc-600 focus:outline-none" placeholder="Kikalo Engineering or personal project" /></div>
                {!isQuoteMode && <div><label className="mb-1.5 block text-xs font-medium tracking-widest text-zinc-400">SHIPPING ADDRESS</label><textarea value={formData.address} onChange={(e) => updateField('address', e.target.value)} rows={2} className="w-full resize-y rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm placeholder:text-zinc-600 focus:border-zinc-600 focus:outline-none" placeholder="123 Main St, Decatur, TX 76234" /></div>}
                <div><label className="mb-1.5 block text-xs font-medium tracking-widest text-zinc-400">{isQuoteMode ? 'CUSTOM REQUIREMENTS / NOTES' : 'ORDER NOTES (OPTIONAL)'}</label><textarea value={formData.notes} onChange={(e) => updateField('notes', e.target.value)} rows={isQuoteMode ? 4 : 2} className="w-full resize-y rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm placeholder:text-zinc-600 focus:border-zinc-600 focus:outline-none" placeholder={isQuoteMode ? "e.g. Need 12 units by Aug 15, black anodize, custom logo engraving..." : "e.g. Black anodize preferred, include extra mounting screws"} /></div>
              </div>

              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row">
                <button type="button" onClick={handleClose} className="flex-1 rounded-2xl border border-zinc-700 py-3.5 text-sm font-medium text-white transition active:bg-zinc-900">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-white py-3.5 text-sm font-semibold text-black transition active:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-70">{isSubmitting ? 'PROCESSING...' : isQuoteMode ? <>REQUEST QUOTE <ArrowRight className="h-4 w-4" /></> : <>SUBMIT ORDER REQUEST <ArrowRight className="h-4 w-4" /></>}</button>
              </div>
              <p className="text-center text-[10px] text-zinc-500">This is a demo. In production this connects to Stripe + your backend.</p>
            </form>
          ) : (
            <div className="px-8 py-10 text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10"><CheckCircle className="h-9 w-9 text-emerald-400" /></div>
              <h3 className="text-2xl font-semibold tracking-tight text-white">{isQuoteMode ? 'Quote request received' : 'Request logged successfully'}</h3>
              <p className="mt-3 text-zinc-400">{isQuoteMode ? "Thank you. Our team will prepare a formal quote and reach out within 1 business day." : "We've captured your order details. In a live system you would receive a Stripe payment link + confirmation email instantly."}</p>
              <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 text-left text-xs text-zinc-400"><div className="font-mono text-[10px] tracking-widest text-zinc-500 mb-1">DEMO NOTE</div>Check browser console for the full submission payload. Real version would trigger Vercel API route, Stripe, and email automation.</div>
              <button onClick={handleClose} className="mt-8 w-full rounded-2xl bg-white py-3.5 text-sm font-semibold text-black active:bg-zinc-200">CLOSE WINDOW</button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
