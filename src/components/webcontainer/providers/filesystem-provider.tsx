'use client'

import { createContext, Dispatch, SetStateAction, useState } from 'react'
import { useWebcontainer } from '../hooks'
import { ReadDirEntry } from '../types'

type Fs = Record<string, ReadDirEntry[]>

type FileSystemContextType = {
  fileSystemOpen: boolean
  setFileSystemOpen: Dispatch<SetStateAction<boolean>>
  toggleFileSystem: () => void
  fs: Fs
  loadFolderItems: (path: string) => Promise<void>
  resetFolderItems: (path: string) => void
  handleFsItemClick: (item: ReadDirEntry) => Promise<void>
}

export const FileSystemContext = createContext<FileSystemContextType | undefined>(undefined)

export const FileSystemProvider = ({ children }: { children: React.ReactNode }) => {
  const [fileSystemOpen, setFileSystemOpen] = useState(true)
  const [fs, setFs] = useState<Fs>({})
  const { readDir, activePath, setView } = useWebcontainer()

  function toggleFileSystem() {
    setFileSystemOpen(!fileSystemOpen)
  }

  async function loadFolderItems(path: string) {
    const items = await readDir(
      path,
      {
        withFileTypes: true
      },
      true
    )
    setFs((prev) => ({
      ...prev,
      [path]: items
    }))
  }

  function resetFolderItems(path: string) {
    setFs((prev) => ({
      ...prev,
      [path]: []
    }))
  }

  async function handleFsItemClick(item: ReadDirEntry) {
    const folderPath = item.path
    if (item.isDirectory()) {
      if (fs[folderPath] && fs[folderPath].length > 0) {
        resetFolderItems(folderPath)
      } else {
        await loadFolderItems(folderPath)
      }
    } else if (item.isFile()) {
      activePath(item.path)
      setView('editor')
    }
  }

  return (
    <FileSystemContext.Provider
      value={{
        fileSystemOpen,
        setFileSystemOpen,
        toggleFileSystem,
        fs,
        loadFolderItems,
        resetFolderItems,
        handleFsItemClick
      }}
    >
      {children}
    </FileSystemContext.Provider>
  )
}
