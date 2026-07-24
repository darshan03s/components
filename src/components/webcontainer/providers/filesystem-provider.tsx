'use client'

import { createContext, useState } from 'react'

type FileSystemContextType = {
  fileSystemOpen: boolean
  toggleFileSystem: () => void
}

export const FileSystemContext = createContext<FileSystemContextType | undefined>(undefined)

export const FileSystemProvider = ({ children }: { children: React.ReactNode }) => {
  const [fileSystemOpen, setFileSystemOpen] = useState(true)

  function toggleFileSystem() {
    setFileSystemOpen(!fileSystemOpen)
  }

  return (
    <FileSystemContext.Provider value={{ fileSystemOpen, toggleFileSystem }}>
      {children}
    </FileSystemContext.Provider>
  )
}
