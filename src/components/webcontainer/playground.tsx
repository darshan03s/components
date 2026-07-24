'use client'

import { WebcontainerProvider } from './providers/webcontainer-provider'
import { FileSystem } from './file-system'
import { FileSystemProvider } from './providers/filesystem-provider'
import { EditorAndPreview } from './editor-and-preview'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowRight, Code, Eye, Terminal } from 'lucide-react'
import { useFileSystem, useWebcontainer } from './hooks'
import { ButtonGroup } from '@/components/ui/button-group'

type PlaygroundProps = {
  loadFromSnapshot?: string
  rootDir?: string
}

export const Playground = ({ ...props }: PlaygroundProps) => {
  return (
    <WebcontainerProvider rootDir={props.rootDir}>
      <FileSystemProvider>
        <Comp {...props} />
      </FileSystemProvider>
    </WebcontainerProvider>
  )
}

const Comp = ({ loadFromSnapshot }: PlaygroundProps) => {
  const { init, view, toggleView } = useWebcontainer()
  const { setFileSystemOpen, fileSystemOpen } = useFileSystem()

  useEffect(() => {
    init(loadFromSnapshot)
  }, [])

  function handleTerminalToggle() {
    window.dispatchEvent(new CustomEvent('toggle-terminal'))
  }

  return (
    <div className="[--playground-width:--spacing(240)] [--playground-height:--spacing(140)] w-(--playground-width) h-(--playground-height) border rounded-lg flex flex-col relative">
      <div className="bg-background rounded-tl-lg rounded-tr-lg min-h-10 h-10 px-2 flex items-center justify-between border-b">
        <div className="flex items-center">
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
        <Button variant={'outline'} size={'icon-xs'} onClick={handleTerminalToggle}>
          <Terminal />
        </Button>
      </div>
      <div className="flex flex-1 min-h-0 [--inner-header-height:--spacing(8)] [--fs-width:--spacing(64)]">
        <FileSystem />
        <EditorAndPreview />
      </div>
      <div className="absolute top-0 left-0 h-full w-10 group">
        <Button
          variant={'default'}
          hidden={fileSystemOpen}
          onClick={() => setFileSystemOpen(true)}
          className="[--indicator-size:--spacing(5)] size-(--indicator-size) rounded-full absolute top-[50%] -left-[calc(var(--indicator-size)/2)] flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          title="Open files"
        >
          <ArrowRight className="size-3" />
        </Button>
      </div>
    </div>
  )
}
