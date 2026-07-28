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
