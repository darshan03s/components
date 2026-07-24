'use client'

import { createContext, Dispatch, SetStateAction, useEffect, useState } from 'react'
import {
  FileSystemAPI,
  FileSystemTree,
  LoadFilesOptions,
  WebContainer,
  WebContainerProcess
} from '@webcontainer/api'
import { ReadDirEntry } from '../types'
import { DEFAULT_ROOT_DIR } from '../constants'
import { Terminal } from '@xterm/xterm'

type Boot = () => Promise<WebContainer>

type Mount = (projectFiles: FileSystemTree, options?: LoadFilesOptions) => Promise<void>

type Spawn = (
  baseCommand: string,
  args: string[],
  output?: { write: boolean; writeFn?: (data: string) => void }
) => Promise<{
  process: WebContainerProcess
  processExitCode: number
}>

type ReadFile = (
  ...args: Parameters<FileSystemAPI['readFile']>
) => ReturnType<FileSystemAPI['readFile']>

type WriteFile = (
  ...args: Parameters<FileSystemAPI['writeFile']>
) => ReturnType<FileSystemAPI['writeFile']>

type MkDir = (...args: Parameters<FileSystemAPI['mkdir']>) => ReturnType<FileSystemAPI['mkdir']>

type ReadDir = (
  path: Parameters<FileSystemAPI['readdir']>['0'],
  options: Parameters<FileSystemAPI['readdir']>['1'],
  foldersFirst?: boolean
) => Promise<ReadDirEntry[]>

type Rm = (...args: Parameters<FileSystemAPI['rm']>) => ReturnType<FileSystemAPI['rm']>

type Rename = (...args: Parameters<FileSystemAPI['rename']>) => ReturnType<FileSystemAPI['rename']>

type LoadSnapshot = (snapshotUrl: string) => Promise<void>

type Init = (loadFromSnapshot?: string) => Promise<void>

type ActiveFile = {
  path: string
  content: string
}

type View = 'editor' | 'preview'

type WebcontainerContextType = {
  wc: WebContainer | null
  boot: Boot
  mount: Mount
  spawn: Spawn
  readFile: ReadFile
  writeFile: WriteFile
  mkDir: MkDir
  readDir: ReadDir
  rm: Rm
  rename: Rename
  loadSnapshot: LoadSnapshot
  mounted: boolean
  init: Init
  rootDir: string
  activePath: (path: string) => void
  activeFile: ActiveFile
  startShell: (terminal: Terminal) => Promise<WebContainerProcess>
  view: View
  setView: Dispatch<SetStateAction<View>>
  toggleView: () => void
  serverUrl: string
}

export const WebcontainerContext = createContext<WebcontainerContextType | undefined>(undefined)

export const WebcontainerProvider = ({
  children,
  rootDir = DEFAULT_ROOT_DIR
}: {
  children: React.ReactNode
  rootDir?: string
}) => {
  const [wc, setWc] = useState<WebContainer | null>(null)
  const [mounted, setMounted] = useState<boolean>(false)
  const [activeFile, setActiveFile] = useState<ActiveFile>({
    path: '',
    content: ''
  })
  const [view, setView] = useState<View>('editor')
  const [serverUrl, setServerUrl] = useState<string>('')

  useEffect(() => {
    if (!wc) return

    function serverReady(_port: number, url: string) {
      setServerUrl(url)
    }

    const unSubscribeServerReady = wc.on('server-ready', serverReady)

    return () => {
      unSubscribeServerReady()
    }
  }, [wc])

  function requireWc(): WebContainer {
    if (!wc) {
      throw new Error('WebContainer is not initialized. Call boot() first.')
    }

    return wc
  }

  const boot: Boot = async () => {
    if (wc) return wc
    const webcontainerInstance = await WebContainer.boot()
    setWc(webcontainerInstance)
    return webcontainerInstance
  }

  const mount: Mount = async (projectFiles, options) => {
    const wc = requireWc()
    await wc.fs.mkdir(rootDir)
    await wc.mount(projectFiles, options)
    setMounted(true)
  }

  const spawn: Spawn = async (baseCommand, args, output) => {
    const wc = requireWc()
    const process = await wc.spawn(baseCommand, args)

    const processExitCode = await process.exit

    if (output?.write) {
      process.output.pipeTo(
        new WritableStream({
          write(data) {
            if (output.writeFn) {
              output.writeFn(data)
            } else {
              console.log(data)
            }
          }
        })
      )
    }

    return {
      process,
      processExitCode
    }
  }

  const readFile: ReadFile = async (path, encoding = 'utf-8') => {
    const wc = requireWc()
    const fileContent = await wc.fs.readFile(path, encoding)
    return fileContent
  }

  const writeFile: WriteFile = async (path, data, options) => {
    const wc = requireWc()
    return await wc.fs.writeFile(path, data, options)
  }

  const mkDir: MkDir = async (folderPath, options) => {
    const wc = requireWc()
    return await wc.fs.mkdir(folderPath, options)
  }

  const readDir: ReadDir = async (path, options, foldersFirst = false) => {
    const wc = requireWc()
    const items = await wc.fs.readdir(path, options)
    const itemsWithPath = items.map((item) => ({
      path: `${path}/${item.name}`,
      name: item.name,
      isFile: () => item.isFile(),
      isDirectory: () => item.isDirectory()
    }))
    if (foldersFirst) {
      const folders = itemsWithPath.filter((i) => i.isDirectory())
      const files = itemsWithPath.filter((i) => i.isFile())
      return [...folders, ...files]
    }
    return itemsWithPath
  }

  const rm: Rm = async (path, options) => {
    const wc = requireWc()
    return await wc.fs.rm(path, options)
  }

  const rename: Rename = async (oldPath, newPath) => {
    const wc = requireWc()
    return await wc.fs.rename(oldPath, newPath)
  }

  const loadSnapshot: LoadSnapshot = async (snapshotUrl: string) => {
    const wc = requireWc()

    const snapshotResponse = await fetch(snapshotUrl)
    const snapshot = await snapshotResponse.arrayBuffer()

    await wc.fs.mkdir(rootDir)
    await wc.mount(snapshot)
    setMounted(true)
  }

  const init: Init = async (loadFromSnapshot) => {
    const wc = await boot()

    if (loadFromSnapshot) {
      const response = await fetch(loadFromSnapshot)
      const snapshot = await response.arrayBuffer()
      await wc.fs.mkdir(rootDir)
      await wc.mount(snapshot, { mountPoint: rootDir })
      setMounted(true)
    }
  }

  const activePath = async (path: string) => {
    const NOT_ALLOWED = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'mp4', 'mov', 'mkv', 'mp3', 'pdf']

    const getExtension = (path: string) => {
      const fileName = path.split('/').pop() ?? ''
      return fileName.includes('.') ? (fileName.split('.').pop()?.toLowerCase() ?? '') : ''
    }

    const ext = getExtension(path)

    if (NOT_ALLOWED.includes(ext)) {
      setActiveFile({
        path,
        content: `Content cannot be displayed for .${ext}`
      })
      return
    }

    const content = await readFile(path, 'utf-8')
    setActiveFile({
      path,
      content
    })
  }

  async function startShell(terminal: Terminal) {
    const wc = requireWc()
    const shellProcess = await wc.spawn(`jsh`, {
      cwd: rootDir,
      terminal: {
        cols: terminal.cols,
        rows: terminal.rows
      }
    })
    shellProcess.output.pipeTo(
      new WritableStream({
        write(data) {
          terminal.write(data)
        }
      })
    )

    const input = shellProcess.input.getWriter()
    terminal.onData((data) => {
      input.write(data)
    })

    return shellProcess
  }

  function toggleView() {
    setView((prev) => {
      if (prev === 'editor') return 'preview'
      else if (prev === 'preview') return 'editor'
      return 'editor'
    })
  }

  return (
    <WebcontainerContext.Provider
      value={{
        boot,
        wc,
        mount,
        spawn,
        readFile,
        writeFile,
        mkDir,
        readDir,
        rm,
        rename,
        loadSnapshot,
        mounted,
        init,
        rootDir,
        activePath,
        activeFile,
        startShell,
        view,
        setView,
        toggleView,
        serverUrl
      }}
    >
      {children}
    </WebcontainerContext.Provider>
  )
}
