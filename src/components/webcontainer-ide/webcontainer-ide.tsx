'use client'

import { FileSystem } from './file-system'
import { Workspace } from './workspace'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Code, Eye, PanelLeft, PanelRight, Terminal } from 'lucide-react'
import { useFileSystem, useProps, useWebContainer } from './hooks'
import { ButtonGroup } from '@/components/ui/button-group'
import { PropsProvider } from './providers/props-provider'
import { WebContainerIDEProps } from './types'

export const WebContainerIDE = ({ ...props }: WebContainerIDEProps) => {
  return (
    <PropsProvider {...props}>
      <Comp />
    </PropsProvider>
  )
}

export const Comp = () => {
  const { init, view, toggleView, mounted } = useWebContainer()
  const { toggleFileSystem, fileSystemOpen } = useFileSystem()
  const { loadFromSnapshot, loadFromTemplate } = useProps()

  useEffect(() => {
    if (mounted) return
    init(loadFromSnapshot, loadFromTemplate)
  }, [mounted])

  function handleTerminalToggle() {
    window.dispatchEvent(new CustomEvent('ide-toggle-terminal'))
  }

  return (
    <div className="relative flex h-(--ide-height) w-(--ide-width) flex-col rounded-lg border [--ide-height:--spacing(140)] [--ide-width:--spacing(240)]">
      <div className="bg-background flex h-10 min-h-10 items-center justify-between rounded-tl-lg rounded-tr-lg border-b px-2">
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
      <div className="flex min-h-0 flex-1 [--fs-width:--spacing(64)] [--inner-header-height:--spacing(8)]">
        <FileSystem />
        <Workspace />
      </div>
    </div>
  )
}
