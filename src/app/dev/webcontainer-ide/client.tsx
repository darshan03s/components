'use client'

import { useTheme } from 'next-themes'
import { WebContainerIDE } from '@/components/webcontainer-ide'

export const Client = ({ template }: { template: string }) => {
  const { resolvedTheme } = useTheme()

  return (
    <WebContainerIDE
      key={template}
      loadFromSnapshot={`/api/snapshot?template=${template}`}
      editorTheme={resolvedTheme as 'light' | 'dark'}
    />
  )
}
