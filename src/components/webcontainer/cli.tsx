'use client'

import { Terminal } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import { useEffect, useRef } from 'react'
import '@xterm/xterm/css/xterm.css'
import { useWebcontainer } from './webcontainer-provider'
import { WebContainerProcess } from '@webcontainer/api'

export const Cli = () => {
  const { startShell, mounted } = useWebcontainer()
  const terminalRef = useRef<Terminal | null>(null)
  const terminalEleRef = useRef<HTMLDivElement | null>(null)
  const fitAddonRef = useRef<FitAddon | null>(null)
  const shellProcessRef = useRef<WebContainerProcess | null>(null)

  useEffect(() => {
    const fitAddon = new FitAddon()
    const terminal = new Terminal({
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

  return (
    <div
      ref={terminalEleRef}
      className="absolute bottom-0 right-0 h-50 max-h-50 bg-background border-t w-full [&_.terminal]:h-full [&_.terminal]:p-2 [&_.terminal]:max-h-50 [&_.xterm-screen]:h-50! [&_.xterm-scrollable-element]:bg-transparent! [&_.xterm-viewport]:no-scrollbar! [&_.xterm-rows]:text-xs! [&_.xterm-rows>div:first-child:empty]:hidden [&_.xterm-rows]:font-mono! [&_.xterm-rows]:h-full! [&_.xterm-viewport]:rounded-br-lg"
    ></div>
  )
}
