'use client'

import dynamic from 'next/dynamic'

const NovaShellConfigurator = dynamic(
  () => import('./NovaShellConfigurator').then(mod => mod.NovaShellConfigurator),
  { ssr: false }
)

export function NovaShellClientWrapper() {
  return <NovaShellConfigurator />
}
