import { useContext } from 'react'
import { FileSystemContext } from './filesystem-provider'
import { WebcontainerContext } from './webcontainer-provider'

export const useFileSystem = () => {
  const context = useContext(FileSystemContext)
  if (!context) {
    throw new Error('useFileSystem must be used within a FileSystemContext')
  }

  return context
}

export const useWebcontainer = () => {
  const context = useContext(WebcontainerContext)
  if (!context) {
    throw new Error('useWebcontainerContext must be used within a WebcontainerProvider')
  }
  return context
}
