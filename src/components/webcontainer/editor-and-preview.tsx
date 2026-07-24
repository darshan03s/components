'use client'

import { Button } from '@/components/ui/button'
import { File, Globe, PanelRight } from 'lucide-react'
import { useFileSystem, useWebcontainer } from './hooks'
import { cn } from '@/lib/utils'
import { Spinner } from '@/components/ui/spinner'
import CodeMirror from '@uiw/react-codemirror'
import { javascript } from '@codemirror/lang-javascript'
import { json } from '@codemirror/lang-json'
import { html } from '@codemirror/lang-html'
import { sass } from '@codemirror/lang-sass'
import { css } from '@codemirror/lang-css'
import { vscodeDark, vscodeLight } from '@uiw/codemirror-theme-vscode'
import { useTheme } from 'next-themes'
import { Terminal } from './terminal'

const EditorComp = ({ className }: { className?: string }) => {
  const { activeFile } = useWebcontainer()
  const { resolvedTheme } = useTheme()

  const extensions = [
    javascript({ jsx: true }),
    json(),
    html({
      autoCloseTags: true,
      matchClosingTags: true,
      selfClosingTags: true
    }),
    sass(),
    css()
  ]

  const theme = resolvedTheme === 'dark' ? vscodeDark : vscodeLight

  return (
    <div className={cn('flex-1 overflow-scroll no-scrollbar', className)}>
      <CodeMirror
        value={activeFile.content}
        extensions={extensions}
        theme={theme}
        className="h-full [&_.cm-activeLine]:bg-transparent! [&_.cm-activeLineGutter]:bg-transparent! [&_.cm-editor]:h-full! [&_.cm-scroller]:no-scrollbar text-sm [&_.cm-editor]:rounded-br-lg"
      />
    </div>
  )
}

const Loading = () => {
  return (
    <div className={cn('flex-1 flex items-center justify-center')}>
      <Spinner />
    </div>
  )
}

const Editor = () => {
  const { fileSystemOpen, toggleFileSystem } = useFileSystem()
  const { activeFile, view } = useWebcontainer()

  return (
    <>
      <div
        hidden={view === 'preview'}
        className={cn(
          'editor-header sticky top-0 left-0 h-(--inner-header-height) min-h-(--inner-header-height) border-b flex items-center px-1 bg-background z-10'
        )}
      >
        <div hidden={fileSystemOpen} className="flex items-center">
          <Button
            variant={'ghost'}
            size={'icon-xs'}
            title="Toggle sidebar"
            onClick={toggleFileSystem}
          >
            <PanelRight />
          </Button>
        </div>
        <span className="text-xs font-semibold">{activeFile.path}</span>
      </div>
      {activeFile.path.length === 0 ? (
        <div
          hidden={view === 'preview'}
          className={cn('flex-1 flex items-center justify-center text-xs')}
        >
          <File className="size-20 text-muted" />
        </div>
      ) : (
        <EditorComp className={view === 'preview' ? 'hidden' : ''} />
      )}
    </>
  )
}

const Preview = () => {
  const { view, serverUrl } = useWebcontainer()
  const { fileSystemOpen, toggleFileSystem } = useFileSystem()

  return (
    <div hidden={view === 'editor'} className="h-full rounded-br-lg flex flex-col">
      <div
        className={cn(
          'preview-header sticky top-0 left-0 h-(--inner-header-height) min-h-(--inner-header-height) border-b flex items-center px-1 bg-background z-10'
        )}
      >
        <div hidden={fileSystemOpen} className="flex items-center">
          <Button
            variant={'ghost'}
            size={'icon-xs'}
            title="Toggle sidebar"
            onClick={toggleFileSystem}
          >
            <PanelRight />
          </Button>
        </div>
      </div>
      <div className="flex-1">
        {serverUrl.length > 0 ? (
          <iframe src={serverUrl} className="h-full w-full" />
        ) : (
          <div className="h-full w-full flex items-center justify-center">
            <Globe className="size-20 text-muted" />
          </div>
        )}
      </div>
    </div>
  )
}

export const EditorAndPreview = () => {
  const { mounted } = useWebcontainer()

  return (
    <div className="flex-1 min-w-0 min-h-0 flex flex-col relative">
      {mounted ? (
        <>
          <Editor />
          <Preview />
        </>
      ) : (
        <Loading />
      )}
      <Terminal />
    </div>
  )
}
