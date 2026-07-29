import { FileSystemTree } from '@webcontainer/api'

export type WebContainerIDEProps = {
  className?: string
  loadFromSnapshot?: string
  loadFromTemplate?: FileSystemTree
  theme: 'light' | 'dark'
}

export type ReadDirEntry = {
  path: string
  name: string
  isFile(): boolean
  isDirectory(): boolean
}

export type FsItemDrag = {
  name: string
  path: string
  type: 'file' | 'folder'
}
