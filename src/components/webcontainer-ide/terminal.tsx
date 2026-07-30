'use client'

import { useEffect, useRef, useState } from 'react'
import { WebContainerProcess } from '@webcontainer/api'
import { FitAddon } from '@xterm/addon-fit'
import { Terminal as XtermTerminal } from '@xterm/xterm'
import '@xterm/xterm/css/xterm.css'
import { TerminalIcon, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '../ui/button'
import { useFileSystem, useProps, useWebContainer } from './hooks'

export const Terminal = () => {
  const { startShell, isMounted, setServerUrl, shellProcessWriter } = useWebContainer()
  const terminalRef = useRef<XtermTerminal | null>(null)
  const terminalEleRef = useRef<HTMLDivElement | null>(null)
  const fitAddonRef = useRef<FitAddon | null>(null)
  const shellProcessRef = useRef<WebContainerProcess | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const { fileSystemOpen } = useFileSystem()
  const { terminalReadOnly } = useProps()

  useEffect(() => {
    const fitAddon = new FitAddon()
    const terminal = new XtermTerminal({
      cursorStyle: 'bar',
      cursorBlink: true,
      convertEol: true
    })
    terminal.options.disableStdin = terminalReadOnly
    terminal.loadAddon(fitAddon)
    terminalRef.current = terminal
    fitAddonRef.current = fitAddon
    if (terminalEleRef.current) {
      terminal.open(terminalEleRef.current)
      fitAddon.fit()
      terminal.attachCustomKeyEventHandler((event) => {
        if (event.ctrlKey && event.key.toLocaleLowerCase() === 'c' && event.type === 'keydown') {
          setServerUrl('')
        }
        if (event.ctrlKey && event.key.toLowerCase() === 'v' && event.type === 'keydown') {
          if (terminalReadOnly) return true
          event.preventDefault()
          navigator.clipboard.readText().then(async (text) => {
            await shellProcessWriter.current?.write(text)
          })
        }
        if (
          event.ctrlKey &&
          event.shiftKey &&
          event.key.toLowerCase() === 'c' &&
          event.type === 'keydown'
        ) {
          event.preventDefault()
          const selection = terminal.getSelection()
          navigator.clipboard.writeText(selection)
        }
        return true
      })
    }
  }, [])

  useEffect(() => {
    if (!isMounted || !terminalRef.current) return

    async function init() {
      const shellProcess = await startShell(terminalRef.current!)
      shellProcessRef.current = shellProcess
    }

    init()
  }, [isMounted])

  useEffect(() => {
    if (!fitAddonRef.current || !shellProcessRef.current || !terminalRef.current) return

    function resize() {
      fitAddonRef.current!.fit()
      shellProcessRef.current!.resize({
        cols: terminalRef.current!.cols,
        rows: terminalRef.current!.rows
      })
    }

    window.addEventListener('resize', resize)

    return () => {
      window.removeEventListener('resize', resize)
    }
  }, [])

  useEffect(() => {
    function toggleTerminal() {
      setIsOpen((prev) => !prev)
    }

    window.addEventListener('ide-toggle-terminal', toggleTerminal)

    return () => {
      window.removeEventListener('ide-toggle-terminal', toggleTerminal)
    }
  }, [])

  return (
    <div
      className={cn(
        'ide-terminal',
        'absolute right-0 bottom-0 w-full',
        '[--terminal-height:--spacing(46)]',
        isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
      )}
    >
      <div className="terminal-header bg-background flex h-8 items-center justify-between border px-2 select-none">
        <span className="text-foreground [&_svg]:text-foreground flex items-center gap-2 font-mono text-xs [&_svg]:size-3">
          <TerminalIcon /> Terminal
        </span>
        <Button variant={'ghost'} size={'icon-xs'} onClick={() => setIsOpen(false)} title="Close">
          <X />
        </Button>
      </div>
      <div
        ref={terminalEleRef}
        className={cn(
          '[&_.terminal]:h-full [&_.terminal]:max-h-(--terminal-height) [&_.terminal]:p-2 [&_.terminal:nth-of-type(2)]:hidden!',
          '[&_.xterm-screen]:h-(--terminal-height)!',
          '[&_.xterm-scrollable-element]:bg-transparent!',
          '[&_.xterm-viewport]:no-scrollbar! [&_.xterm-viewport]:rounded-br-lg',
          !fileSystemOpen ? '[&_.xterm-viewport]:rounded-bl-lg' : '',
          '[&_.xterm-rows]:h-full! [&_.xterm-rows]:font-mono! [&_.xterm-rows]:text-xs! [&_.xterm-rows>div:first-child:empty]:hidden'
        )}
      />
    </div>
  )
}
