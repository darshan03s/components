'use client'

import { WebContainerProvider } from './webcontainer-provider'
import { FileSystemProvider } from './filesystem-provider'

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
