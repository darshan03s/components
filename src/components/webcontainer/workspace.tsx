'use client'

import { File, Globe } from 'lucide-react'
import { useWebcontainer } from './hooks'
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
  const { activeFile, writeFile } = useWebcontainer()
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

  const onChange = (val: string) => {
    writeFile(activeFile.path, val)
  }

  return (
    <div className={cn('flex-1 overflow-scroll no-scrollbar', className)}>
      <CodeMirror
        onChange={onChange}
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
  const { activeFile, view } = useWebcontainer()

  return (
    <>
      <div
        hidden={view === 'preview' || activeFile.path.length === 0}
        className={cn(
          'editor-header sticky top-0 left-0 h-(--inner-header-height) min-h-(--inner-header-height) border-b flex items-center px-2 bg-background z-10'
        )}
      >
        <span className="text-xs font-semibold line-clamp-1">{activeFile.path}</span>
      </div>
      {activeFile.path.length === 0 ? (
        <div
          hidden={view === 'preview'}
          className={cn('flex-1 flex items-center justify-center text-xs')}
        >
          <File className="size-20 text-foreground/10" strokeWidth={1} />
        </div>
      ) : (
        <EditorComp className={view === 'preview' ? 'hidden' : ''} />
      )}
    </>
  )
}

const Preview = () => {
  const { view, serverUrl } = useWebcontainer()

  return (
    <div hidden={view === 'editor'} className="h-full rounded-br-lg flex flex-col">
      <div className="flex-1">
        {serverUrl.length > 0 ? (
          <iframe src={serverUrl} className="h-full w-full" />
        ) : (
          <div className="h-full w-full flex items-center justify-center">
            <Globe className="size-20 text-foreground/10" strokeWidth={1} />
          </div>
        )}
      </div>
    </div>
  )
}

export const Workspace = () => {
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
