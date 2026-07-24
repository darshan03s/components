'use client'

import { Terminal as XtermTerminal } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import { useEffect, useRef, useState } from 'react'
import '@xterm/xterm/css/xterm.css'
import { useWebcontainer } from './hooks'
import { WebContainerProcess } from '@webcontainer/api'
import { cn } from '@/lib/utils'

export const Terminal = () => {
  const { startShell, mounted } = useWebcontainer()
  const terminalRef = useRef<XtermTerminal | null>(null)
  const terminalEleRef = useRef<HTMLDivElement | null>(null)
  const fitAddonRef = useRef<FitAddon | null>(null)
  const shellProcessRef = useRef<WebContainerProcess | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const fitAddon = new FitAddon()
    const terminal = new XtermTerminal({
      cursorStyle: 'bar',
      cursorBlink: true,
      convertEol: true
    })
    terminal.loadAddon(fitAddon)
    terminalRef.current = terminal
    fitAddonRef.current = fitAddon
    if (terminalEleRef.current) {
      terminal.open(terminalEleRef.current)
      fitAddon.fit()
    }
  }, [])

  useEffect(() => {
    if (!mounted || !terminalRef.current) return

    async function init() {
      const shellProcess = await startShell(terminalRef.current!)
      shellProcessRef.current = shellProcess
    }

    init()
  }, [mounted])

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

    window.addEventListener('toggle-terminal', toggleTerminal)

    return () => {
      window.removeEventListener('toggle-terminal', toggleTerminal)
    }
  }, [])

  return (
    <div
      ref={terminalEleRef}
      className={cn(
        'absolute bottom-0 right-0 h-50 max-h-50 bg-background border-t w-full [&_.terminal]:h-full [&_.terminal]:p-2 [&_.terminal]:max-h-50 [&_.xterm-screen]:h-50! [&_.xterm-scrollable-element]:bg-transparent! [&_.xterm-viewport]:no-scrollbar! [&_.xterm-rows]:text-xs! [&_.xterm-rows>div:first-child:empty]:hidden [&_.xterm-rows]:font-mono! [&_.xterm-rows]:h-full! [&_.xterm-viewport]:rounded-br-lg',
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      )}
    ></div>
  )
}
