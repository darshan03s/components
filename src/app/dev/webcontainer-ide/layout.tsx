'use client'

import Link from 'next/link'
import Main from '@/components/main'
import { WebContainerIDEProvider } from '@/components/webcontainer-ide'

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <WebContainerIDEProvider>
      <Main className="flex flex-col">
        <div className="h-10 bg-secondary flex items-center gap-4 px-2 [&_a]:text-xs font-semibold">
          <Link href={'/dev/webcontainer-ide/all'}>All</Link>
          <Link href={'/dev/webcontainer-ide/vite-jsx'}>Vite JSX</Link>
          <Link href={'/dev/webcontainer-ide/vite-tsx'}>Vite TSX</Link>
        </div>
        <div className="flex-1 flex items-center justify-center">{children}</div>
      </Main>
    </WebContainerIDEProvider>
  )
}

export default Layout
