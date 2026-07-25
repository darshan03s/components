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
  handleFsItemClick: (item: ReadDirEntry, open?: true) => Promise<void>
  isFolderOpen: (path: string) => boolean
  newFolderParent: string
  setNewFolderParent: Dispatch<SetStateAction<string>>
}

export const FileSystemContext = createContext<FileSystemContextType | undefined>(undefined)

export const FileSystemProvider = ({ children }: { children: React.ReactNode }) => {
  const { readDir, activePath, setView } = useWebcontainer()
  const [fileSystemOpen, setFileSystemOpen] = useState(true)
  const [fs, setFs] = useState<Fs>({})
  const [openFolders, setOpenFolders] = useState(new Set<string>())
  const [newFolderParent, setNewFolderParent] = useState('')

  function toggleFileSystem() {
    setFileSystemOpen(!fileSystemOpen)
  }

  function toggleFolderOpen(folderPath: string) {
    setOpenFolders((prev) => {
      const next = new Set(prev)

      if (next.has(folderPath)) {
        next.delete(folderPath)
      } else {
        next.add(folderPath)
      }

      return next
    })
  }

  function isFolderOpen(path: string) {
    return openFolders.has(path)
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

  async function handleFsItemClick(item: ReadDirEntry, open?: true) {
    const folderPath = item.path
    if (item.isDirectory()) {
      if (!fs[folderPath] || fs[folderPath].length === 0) {
        await loadFolderItems(folderPath)
      }
      if (open) {
        setOpenFolders((prev) => {
          const next = new Set(prev)
          next.add(folderPath)
          return next
        })
      } else {
        toggleFolderOpen(folderPath)
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
        handleFsItemClick,
        isFolderOpen,
        newFolderParent,
        setNewFolderParent
      }}
    >
      {children}
    </FileSystemContext.Provider>
  )
}
