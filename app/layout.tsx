import type { Metadata } from 'next'
import './globals.css'  // optional – you can delete this line if you want

export const metadata: Metadata = {
  title: 'Kikalo Designs – Instant Sheet Metal DXF',
  description: 'Parametric sheet-metal parts for laser cutting',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
