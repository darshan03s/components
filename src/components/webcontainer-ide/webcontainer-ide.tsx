'use client'

import { FileSystem } from './file-system'
import { Workspace } from './workspace'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Code, Eye, PanelLeft, PanelRight, Terminal } from 'lucide-react'
import { useFileSystem, useWebcontainer } from './hooks'
import { ButtonGroup } from '@/components/ui/button-group'
import { FileSystemTree } from '@webcontainer/api'

type WebContainerIDEProps = {
  loadFromSnapshot?: string
  loadFromTemplate?: FileSystemTree
}

export const WebContainerIDE = ({ loadFromSnapshot, loadFromTemplate }: WebContainerIDEProps) => {
  const { init, view, toggleView, mounted } = useWebcontainer()
  const { toggleFileSystem, fileSystemOpen } = useFileSystem()

  useEffect(() => {
    if (mounted) return
    init(loadFromSnapshot, loadFromTemplate)
  }, [mounted])

  function handleTerminalToggle() {
    window.dispatchEvent(new CustomEvent('ide-toggle-terminal'))
  }

  return (
    <div className="[--ide-width:--spacing(240)] [--ide-height:--spacing(140)] w-(--ide-width) h-(--ide-height) border rounded-lg flex flex-col relative">
      <div className="bg-background rounded-tl-lg rounded-tr-lg min-h-10 h-10 px-2 flex items-center justify-between border-b">
        <div className="flex items-center gap-4">
          <Button
            size={'icon-xs'}
            variant={'ghost'}
            onClick={toggleFileSystem}
            title="Toggle files"
          >
            {fileSystemOpen ? <PanelLeft /> : <PanelRight />}
          </Button>
          <ButtonGroup>
            <Button
              size={'icon-xs'}
              variant={view === 'editor' ? 'default' : 'outline'}
              onClick={toggleView}
            >
              <Code />
            </Button>
            <Button
              size={'icon-xs'}
              variant={view === 'preview' ? 'default' : 'outline'}
              onClick={toggleView}
            >
              <Eye />
            </Button>
          </ButtonGroup>
        </div>
        <Button
          variant={'outline'}
          size={'icon-xs'}
          onClick={handleTerminalToggle}
          disabled={!mounted}
        >
          <Terminal />
        </Button>
      </div>
      <div className="flex flex-1 min-h-0 [--inner-header-height:--spacing(8)] [--fs-width:--spacing(64)]">
        <FileSystem />
        <Workspace />
      </div>
    </div>
  )
}
