export interface NovaShellVariant {
  id: string
  name: string
  description: string
  dimensions: { width: number; depth: number; height: number }
  price: number
  leadTime: string
  useCase: string
  material: string
  finish: string
  estWeight: string
  stepFileName: string
  popular?: boolean
  features?: string[]
}

export const variants: NovaShellVariant[] = [
  {
    id: 'pi-zero',
    name: 'Pi Zero Shell',
    description: 'Ultra-compact enclosure for Raspberry Pi Zero 2 W, Zero W, and small HATs.',
    dimensions: { width: 72, depth: 34, height: 26 },
    price: 79,
    leadTime: '1-3 business days',
    useCase: 'Portable IoT, sensors, embedded Linux projects, drones',
    material: '6061-T6 Aluminum',
    finish: 'Type II Clear Anodize (Black available on request)',
    estWeight: '78g',
    stepFileName: 'novashell-pi-zero.step',
    popular: true,
    features: ['Minimal footprint', 'HAT clearance', 'Wall & desk mount ready']
  },
  {
    id: 'pi-5-compact',
    name: 'Pi 5 Compact',
    description: 'Optimized for Raspberry Pi 5 with active cooler and standard HATs. Excellent cable management.',
    dimensions: { width: 112, depth: 78, height: 34 },
    price: 99,
    leadTime: '2-4 business days',
    useCase: 'Desktop SBC builds, media centers, NAS nodes, robotics controllers',
    material: '6061-T6 Aluminum',
    finish: 'Type II Clear Anodize',
    estWeight: '142g',
    stepFileName: 'novashell-pi-5-compact.step',
    popular: true,
    features: ['Active cooler clearance', 'Full GPIO access', 'Vented sides']
  },
  {
    id: 'sbc-medium',
    name: 'Medium SBC',
    description: 'Versatile size for Jetson Orin Nano, Pi CM4 clusters, Radxa, or custom carrier boards.',
    dimensions: { width: 128, depth: 92, height: 42 },
    price: 119,
    leadTime: '2-4 business days',
    useCase: 'AI edge devices, multi-board stacks, industrial gateways',
    material: '6061-T6 Aluminum',
    finish: 'Type II Clear Anodize',
    estWeight: '168g',
    stepFileName: 'novashell-sbc-medium.step',
    features: ['Stackable design', 'Generous internal volume', 'Multiple port options']
  },
  {
    id: 'tall-stack',
    name: 'Tall Stack',
    description: 'Extra internal height for PoE HATs, large displays, stacked boards, or custom mezzanines.',
    dimensions: { width: 112, depth: 78, height: 68 },
    price: 129,
    leadTime: '2-5 business days',
    useCase: 'Multi-HAT builds, touch displays, power electronics, prototypes',
    material: '6061-T6 Aluminum',
    finish: 'Type II Clear Anodize',
    estWeight: '195g',
    stepFileName: 'novashell-tall-stack.step',
    features: ['68mm internal height', 'Excellent for displays', 'Modular plate ready']
  },
  {
    id: 'wide-proto',
    name: 'Wide Proto',
    description: 'Spacious for large PCBs, perfboards, breadboard adapters, or multiple modules side-by-side.',
    dimensions: { width: 185, depth: 115, height: 38 },
    price: 149,
    leadTime: '3-5 business days',
    useCase: 'Prototyping, test fixtures, custom electronics, education kits',
    material: '6061-T6 Aluminum',
    finish: 'Type II Clear Anodize',
    estWeight: '245g',
    stepFileName: 'novashell-wide-proto.step',
    features: ['Large work area', 'Flat bottom for stability', 'Easy panel swaps']
  },
  {
    id: 'oem-large',
    name: 'OEM Large',
    description: 'Industrial-grade size for controllers, multiple I/O modules, power supplies, or small gateways.',
    dimensions: { width: 225, depth: 145, height: 55 },
    price: 189,
    leadTime: '4-7 business days',
    useCase: 'OEM equipment, DIN-rail ready (future), machine control, edge servers',
    material: '6061-T6 Aluminum',
    finish: 'Type II Clear Anodize (or custom powder coat)',
    estWeight: '385g',
    stepFileName: 'novashell-oem-large.step',
    features: ['Heavy duty', 'High I/O capacity', 'Future DIN rail & flange options']
  }
]

export function getVariantById(id: string): NovaShellVariant | undefined {
  return variants.find(v => v.id === id)
}

export const defaultVariantId = 'pi-5-compact'
