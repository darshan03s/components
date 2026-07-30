'use client'

import { useEffect, useRef } from 'react'
import { FitAddon } from '@xterm/addon-fit'
import { Terminal as XtermTerminal } from '@xterm/xterm'
import '@xterm/xterm/css/xterm.css'
import { TerminalIcon, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useFileSystem, useProps, useTerminal, useWebContainer } from './hooks'

export const Terminal = () => {
  const { startShell, isMounted, setServerUrl } = useWebContainer()
  const {
    terminalRef,
    fitAddonRef,
    shellProcessRef,
    setTerminalRef,
    setFitAddonRef,
    setShellProcessRef,
    isTerminalStarted,
    isTerminalOpen,
    setIsTerminalOpen
  } = useTerminal()
  const { fileSystemOpen } = useFileSystem()
  const { terminalReadOnly, hideTerminal } = useProps()
  const terminalEleRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!isMounted) return
    const fitAddon = new FitAddon()
    const terminal = new XtermTerminal({
      cursorStyle: 'bar',
      cursorBlink: true,
      convertEol: true
    })
    terminal.options.disableStdin = terminalReadOnly
    terminal.loadAddon(fitAddon)
    terminal.open(terminalEleRef.current!)
    fitAddon.fit()
    setTerminalRef(terminal)
    setFitAddonRef(fitAddon)
    terminal.attachCustomKeyEventHandler((event) => {
      if (event.ctrlKey && event.key.toLocaleLowerCase() === 'c' && event.type === 'keydown') {
        setServerUrl('')
      }
      if (event.ctrlKey && event.key.toLowerCase() === 'v' && event.type === 'keydown') {
        if (terminalReadOnly) return true
        event.preventDefault()
        navigator.clipboard.readText().then(async (text) => {
          terminal.paste(text)
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
  }, [isMounted])

  useEffect(() => {
    if (!isMounted) return

    async function init() {
      const shellProcess = await startShell(terminalRef.current!)
      setShellProcessRef(shellProcess)
    }

    init()
  }, [isMounted])

  useEffect(() => {
    if (!isTerminalStarted) return

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
  }, [isTerminalStarted])

  const showTerminal = (() => {
    if (hideTerminal) return false
    return isTerminalOpen
  })()

  return (
    <div
      className={cn(
        'ide-terminal',
        'absolute right-0 bottom-0 w-full',
        '[--terminal-height:--spacing(46)]',
        showTerminal ? 'opacity-100' : 'pointer-events-none opacity-0'
      )}
    >
      <div className="terminal-header bg-background flex h-8 items-center justify-between border px-2 select-none">
        <span className="text-foreground [&_svg]:text-foreground flex items-center gap-2 font-mono text-xs [&_svg]:size-3">
          <TerminalIcon /> Terminal
        </span>
        <Button
          variant={'ghost'}
          size={'icon-xs'}
          onClick={() => setIsTerminalOpen(false)}
          title="Close"
        >
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
