'use client'

import { WebContainerIDE, WebContainerIDEProvider } from '@/components/webcontainer-ide'
import { useTheme } from 'next-themes'
import Main from '@/components/main'

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
