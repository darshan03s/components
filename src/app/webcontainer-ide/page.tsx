'use client'

import Main from '@/components/main'
import { WebContainerIDE, WebContainerIDEProvider } from '@/components/webcontainer-ide'
import { useTheme } from 'next-themes'

const Page = () => {
  const { resolvedTheme } = useTheme()

  return (
    <Main className="flex items-center justify-center">
      <WebContainerIDEProvider>
        <WebContainerIDE
          loadFromSnapshot="/api/snapshot?template=all"
          theme={resolvedTheme as 'light' | 'dark'}
        />
      </WebContainerIDEProvider>
    </Main>
  )
}

export default Page
