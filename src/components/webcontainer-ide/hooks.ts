import { useContext } from 'react'
import { FileSystemContext } from './providers/filesystem-provider'
import { WebcontainerContext } from './providers/webcontainer-provider'
import { PropsContext } from './providers/props-provider'

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

export const useProps = () => {
  const context = useContext(PropsContext)
  if (!context) {
    throw new Error('useProps must be used within a PropsContext')
  }
  return context
}
