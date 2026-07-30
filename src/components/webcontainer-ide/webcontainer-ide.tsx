'use client'

import { useEffect } from 'react'
import { Code, Eye, PanelLeft, PanelRight, Terminal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
import { cn } from '@/lib/utils'
import { FileSystem } from './file-system'
import { useFileSystem, useIde, useProps, useTerminal, useWebContainer } from './hooks'
import { PropsProvider } from './providers/props-provider'
import { WebContainerIDEProps } from './types'
import { Workspace } from './workspace'

export const WebContainerIDE = ({ ...props }: WebContainerIDEProps) => {
  return (
    <PropsProvider {...props}>
      <Comp />
    </PropsProvider>
  )
}

export const Comp = () => {
  const { init, isMounted } = useWebContainer()
  const { view, toggleView } = useIde()
  const { toggleFileSystem, fileSystemOpen } = useFileSystem()
  const { setIsTerminalOpen } = useTerminal()
  const { loadFromSnapshot, loadFromTemplate, className } = useProps()

  useEffect(() => {
    if (isMounted) return
    init(loadFromSnapshot, loadFromTemplate)
  }, [isMounted])

  function handleTerminalToggle() {
    setIsTerminalOpen((prev) => !prev)
  }

  return (
    <div
      className={cn(
        'ide-container relative flex h-(--ide-height) w-(--ide-width) flex-col rounded-lg border [--ide-height:--spacing(140)] [--ide-width:--spacing(240)]',
        className
      )}
    >
      <div className="ide-header bg-background flex h-10 min-h-10 items-center justify-between rounded-tl-lg rounded-tr-lg border-b px-2">
        <div className="flex items-center gap-4">
          <Button
            className="ide-file-system-toggle"
            size={'icon-xs'}
            variant={'ghost'}
            onClick={toggleFileSystem}
            title="Toggle files"
          >
            {fileSystemOpen ? <PanelLeft /> : <PanelRight />}
          </Button>
          <ButtonGroup>
            <Button
              className="ide-editor-toggle"
              size={'icon-xs'}
              variant={view === 'editor' ? 'default' : 'outline'}
              onClick={toggleView}
              title="Editor"
            >
              <Code />
            </Button>
            <Button
              className="ide-preview-toggle"
              size={'icon-xs'}
              variant={view === 'preview' ? 'default' : 'outline'}
              onClick={toggleView}
              title="Preview"
            >
              <Eye />
            </Button>
          </ButtonGroup>
        </div>
        <Button
          className="ide-terminal-toggle"
          variant={'outline'}
          size={'icon-xs'}
          onClick={handleTerminalToggle}
          disabled={!isMounted}
          title="Toggle terminal"
        >
          <Terminal />
        </Button>
      </div>
      <div className="flex min-h-0 flex-1 [--fs-width:--spacing(64)] [--inner-header-height:--spacing(8)]">
        <FileSystem />
        <Workspace />
      </div>
    </div>
  )
}
