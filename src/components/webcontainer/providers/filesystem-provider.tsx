'use client'

import { createContext, Dispatch, SetStateAction, useState } from 'react'

type FileSystemContextType = {
  fileSystemOpen: boolean
  setFileSystemOpen: Dispatch<SetStateAction<boolean>>
  toggleFileSystem: () => void
}

export const FileSystemContext = createContext<FileSystemContextType | undefined>(undefined)

export const FileSystemProvider = ({ children }: { children: React.ReactNode }) => {
  const [fileSystemOpen, setFileSystemOpen] = useState(true)

  function toggleFileSystem() {
    setFileSystemOpen(!fileSystemOpen)
  }

  return (
    <FileSystemContext.Provider value={{ fileSystemOpen, setFileSystemOpen, toggleFileSystem }}>
      {children}
    </FileSystemContext.Provider>
  )
}
