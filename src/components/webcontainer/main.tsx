'use client'

import { Button } from '@/components/ui/button'
import { PanelRight, Terminal } from 'lucide-react'
import { useFileSystemContext } from './filesystem-provider'
import { cn } from '@/lib/utils'

const Main = () => {
  const { fileSystemOpen, toggleFileSystem } = useFileSystemContext()

  return (
    <div className="flex-1">
      <div
        className={cn(
          'main-tree sticky top-0 left-0 h-8 px-2 border-b flex items-center',
          fileSystemOpen ? 'justify-end' : 'justify-between'
        )}
      >
        <Button
          variant={'ghost'}
          size={'icon-xs'}
          title="Toggle sidebar"
          hidden={fileSystemOpen}
          onClick={toggleFileSystem}
        >
          <PanelRight />
        </Button>
        <Button variant={'ghost'} size={'icon-xs'}>
          <Terminal />
        </Button>
      </div>
      <div>Main</div>
    </div>
  )
}

export default Main
