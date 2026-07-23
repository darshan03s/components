'use client'

import { createContext, useContext, useState } from 'react'

type FileSystemContextType = {
  fileSystemOpen: boolean
  toggleFileSystem: () => void
}

const FileSystemContext = createContext<FileSystemContextType | undefined>(undefined)

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

export const useFileSystem = () => {
  const context = useContext(FileSystemContext)
  if (!context) {
    throw new Error('useFileSystem must be used within a FileSystemContext')
  }

  return context
}
