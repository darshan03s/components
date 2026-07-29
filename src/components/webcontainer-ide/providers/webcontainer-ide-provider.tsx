'use client'

import { FileSystemProvider } from './filesystem-provider'
import { WebContainerProvider } from './webcontainer-provider'

export const WebContainerIDEProvider = ({
  children,
  rootDir
}: {
  children: React.ReactNode
  rootDir?: string
}) => {
  return (
    <WebContainerProvider rootDir={rootDir}>
      <FileSystemProvider>{children}</FileSystemProvider>
    </WebContainerProvider>
  )
}
