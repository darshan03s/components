import { useContext } from 'react'
import { FileSystemContext } from './providers/filesystem-provider'
import { PropsContext } from './providers/props-provider'
import { WebContainerIDEContext } from './providers/webcontainer-ide-provider'
import { WebContainerContext } from './providers/webcontainer-provider'

export const useFileSystem = () => {
  const context = useContext(FileSystemContext)
  if (!context) {
    throw new Error('useFileSystem must be used within a FileSystemContext')
  }
  return context
}

export const useWebContainer = () => {
  const context = useContext(WebContainerContext)
  if (!context) {
    throw new Error('useWebContainer must be used within a WebContainerProvider')
  }
  return context
}

export const useIde = () => {
  const context = useContext(WebContainerIDEContext)
  if (!context) {
    throw new Error('useIde must be used within a WebContainerIDEProvider')
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
