'use client'

import { createContext, Dispatch, RefObject, SetStateAction, useRef, useState } from 'react'
import { FsItemDrag, ReadDirEntry } from '../types'
import { IGNORED_FOLDERS } from '../constants'
import { getParentFolder } from '../utils'
import { useWebContainer } from '../hooks'

type Fs = Record<string, ReadDirEntry[]>

type FileSystemContextType = {
  fileSystemOpen: boolean
  setFileSystemOpen: Dispatch<SetStateAction<boolean>>
  toggleFileSystem: () => void
  fs: Fs
  loadFolderItems: (path: string) => Promise<void>
  handleFsItemClick: (item: ReadDirEntry, open?: true) => Promise<void>
  isFolderOpen: (path: string) => boolean
  newFsItem: NewFsItem | null
  setNewFsItem: Dispatch<SetStateAction<NewFsItem | null>>
  collapseAllFolders: () => void
  isIgnoredPath: (path: string) => boolean
  hoveredPath: string | null
  setHoveredPath: Dispatch<SetStateAction<string | null>>
  draggedItem: RefObject<FsItemDrag | null>
  openFolder: (path: string) => Promise<void>
  closeFolder: (path: string) => void
  clearFolder: (path: string) => void
  handleFsItemDrop: (source: FsItemDrag, destination: string) => Promise<void>
  startFsItemMove: (item: FsItemDrag) => void
  endFsItemMove: () => void
}

type NewFsItem = {
  parent: string
  type: 'folder' | 'file'
}

export const FileSystemContext = createContext<FileSystemContextType | undefined>(undefined)

export const FileSystemProvider = ({ children }: { children: React.ReactNode }) => {
  const { readDir, activePath, setView, mv, activeFile } = useWebContainer()
  const [fileSystemOpen, setFileSystemOpen] = useState(true)
  const [fs, setFs] = useState<Fs>({})
  const [openFolders, setOpenFolders] = useState(new Set<string>())
  const [newFsItem, setNewFsItem] = useState<NewFsItem | null>(null)
  const [hoveredPath, setHoveredPath] = useState<string | null>(null)
  const draggedItem = useRef<FsItemDrag | null>(null)

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
    if (IGNORED_FOLDERS.some((dir) => path.includes(dir))) return
    try {
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
    } catch {}
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

  function collapseAllFolders() {
    setOpenFolders(new Set())
  }

  async function openFolder(path: string) {
    await loadFolderItems(path)
    setOpenFolders((prev) => {
      const next = new Set(prev)
      next.add(path)
      return next
    })
  }

  function closeFolder(path: string) {
    setOpenFolders((prev) => {
      const next = new Set(prev)
      next.delete(path)
      return next
    })
  }

  function clearFolder(path: string) {
    closeFolder(path)
    if (fs[path]) {
      setFs((prev) => {
        const { [path]: _, ...rest } = prev
        return rest
      })
    }
  }

  function isIgnoredPath(path: string) {
    return path.split('/').some((segment) => IGNORED_FOLDERS.includes(segment))
  }

  function startFsItemMove(item: FsItemDrag) {
    draggedItem.current = item
  }

  function endFsItemMove() {
    draggedItem.current = null
    setHoveredPath(null)
  }

  async function handleFsItemDrop(source: FsItemDrag, destination: string) {
    const parent = getParentFolder(source.path)
    if (parent === destination) return
    await mv(source.path, destination)
    if (source.type === 'file' && activeFile.path === source.path) {
      const newPath = `${destination}/${source.name}`
      activePath(newPath)
    }
    if (source.type === 'folder') {
      clearFolder(source.path)
      if (activeFile.path.startsWith(source.path + '/')) {
        activePath(activeFile.path.replace(source.path, `${destination}/${source.name}`))
      }
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
        handleFsItemClick,
        isFolderOpen,
        newFsItem,
        setNewFsItem,
        collapseAllFolders,
        isIgnoredPath,
        hoveredPath,
        setHoveredPath,
        draggedItem,
        openFolder,
        closeFolder,
        handleFsItemDrop,
        startFsItemMove,
        endFsItemMove,
        clearFolder
      }}
    >
      {children}
    </FileSystemContext.Provider>
  )
}
