'use client'

import { FileSystemProvider } from './filesystem-provider'
import { WebcontainerProvider } from './webcontainer-provider'

export const WebContainerIDEProvider = ({
  children,
  rootDir
}: {
  children: React.ReactNode
  rootDir?: string
}) => {
  return (
    <WebcontainerProvider rootDir={rootDir}>
      <FileSystemProvider>{children}</FileSystemProvider>
    </WebcontainerProvider>
  )
}
