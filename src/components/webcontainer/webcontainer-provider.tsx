'use client'

import { createContext, useContext, useState } from 'react'
import {
  FileSystemAPI,
  FileSystemTree,
  LoadFilesOptions,
  WebContainer,
  WebContainerProcess
} from '@webcontainer/api'
import { ReadDirEntry } from './types'

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

type ReadDir = (...args: Parameters<FileSystemAPI['readdir']>) => Promise<ReadDirEntry[]>

type Rm = (...args: Parameters<FileSystemAPI['rm']>) => ReturnType<FileSystemAPI['rm']>

type Rename = (...args: Parameters<FileSystemAPI['rename']>) => ReturnType<FileSystemAPI['rename']>

type LoadSnapshot = (snapshotUrl: string) => Promise<void>

type Init = (loadFromSnapshot?: string) => Promise<void>

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
}

const WebcontainerContext = createContext<WebcontainerContextType | undefined>(undefined)

export const WebcontainerProvider = ({ children }: { children: React.ReactNode }) => {
  const [wc, setWc] = useState<WebContainer | null>(null)
  const [mounted, setMounted] = useState<boolean>(false)

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

  const readDir: ReadDir = async (path, options) => {
    const wc = requireWc()
    const items = await wc.fs.readdir(path, options)
    const itemsWithPath = items.map((item) => ({
      path: `${path}/${item.name}`,
      name: item.name,
      isFile: () => item.isFile(),
      isDirectory: () => item.isDirectory()
    }))
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

    await wc.mount(snapshot)
    setMounted(true)
  }

  const init: Init = async (loadFromSnapshot) => {
    const wc = await boot()

    if (loadFromSnapshot) {
      const response = await fetch(loadFromSnapshot)
      const snapshot = await response.arrayBuffer()
      await wc.mount(snapshot)
      setMounted(true)
    }
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
        init
      }}
    >
      {children}
    </WebcontainerContext.Provider>
  )
}

export const useWebcontainerContext = () => {
  const context = useContext(WebcontainerContext)
  if (!context) {
    throw new Error('useWebcontainerContext must be used within a WebcontainerProvider')
  }
  return context
}
