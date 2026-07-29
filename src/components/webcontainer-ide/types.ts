import { FileSystemTree } from '@webcontainer/api'

export type WebContainerIDEProps = {
  loadFromSnapshot?: string
  loadFromTemplate?: FileSystemTree
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
