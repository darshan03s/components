'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useTheme } from 'next-themes'
import Main from '@/components/main'
import { WebContainerIDE } from '@/components/webcontainer-ide'

export const Client = () => {
  const { resolvedTheme } = useTheme()
  const params = useSearchParams()

  const template = params.get('template') ?? 'all'

  return (
    <Main className="flex items-center justify-center">
      <div>
        <div className="[&_a]:px-2">
          <Link href={'/dev/webcontainer-ide?template=all'}>all</Link>
          <Link href={'/dev/webcontainer-ide?template=vite-jsx'}>vite-jsx</Link>
          <Link href={'/dev/webcontainer-ide?template=vite-tsx'}>vite-tsx</Link>
        </div>
        <WebContainerIDE
          key={template}
          loadFromSnapshot={`/api/snapshot?template=${template}`}
          theme={resolvedTheme as 'light' | 'dark'}
        />
      </div>
    </Main>
  )
}
