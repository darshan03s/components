'use client'

import { useTheme } from 'next-themes'
import Main from '@/components/main'
import { WebContainerIDE } from '@/components/webcontainer-ide'

export const Client = () => {
  const { resolvedTheme } = useTheme()

  return (
    <Main className="flex items-center justify-center">
      <WebContainerIDE
        loadFromSnapshot="/api/snapshot?template=all"
        theme={resolvedTheme as 'light' | 'dark'}
      />
    </Main>
  )
}
