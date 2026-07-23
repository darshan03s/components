'use client'

import { Button } from '@/components/ui/button'
import { File, PanelRight } from 'lucide-react'
import { useFileSystem } from './filesystem-provider'
import { cn } from '@/lib/utils'
import { useWebcontainer } from './webcontainer-provider'
import { Spinner } from '@/components/ui/spinner'
import CodeMirror from '@uiw/react-codemirror'
import { javascript } from '@codemirror/lang-javascript'
import { json } from '@codemirror/lang-json'
import { html } from '@codemirror/lang-html'
import { sass } from '@codemirror/lang-sass'
import { css } from '@codemirror/lang-css'
import { vscodeDark, vscodeLight } from '@uiw/codemirror-theme-vscode'
import { useTheme } from 'next-themes'

const EditorComp = () => {
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
    <div className="flex-1 overflow-scroll no-scrollbar">
      <CodeMirror
        value={activeFile.content}
        extensions={extensions}
        theme={theme}
        className="h-full [&_.cm-activeLine]:bg-transparent! [&_.cm-activeLineGutter]:bg-transparent! [&_.cm-editor]:h-full! [&_.cm-scroller]:no-scrollbar text-sm"
      />
    </div>
  )
}

export const Editor = () => {
  const { fileSystemOpen, toggleFileSystem } = useFileSystem()
  const { activeFile, mounted } = useWebcontainer()

  return (
    <div className="flex-1 min-w-0 min-h-0 flex flex-col">
      <div
        className={cn(
          'main-tree sticky top-0 left-0 h-(--inner-header-height) min-h-(--inner-header-height) border-b flex items-center px-1 bg-background z-10'
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
      {mounted ? (
        activeFile.path.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-xs">
            <span>
              <File className="size-20 text-muted" />
            </span>
          </div>
        ) : (
          <EditorComp />
        )
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <Spinner />
        </div>
      )}
    </div>
  )
}
