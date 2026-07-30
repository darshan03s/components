import { FileSystemTree } from '@webcontainer/api'

export type WebContainerIDEProps = {
  className?: string
  /**
   * URL of an API endpoint that returns a WebContainer snapshot.
   *
   * You must implement this endpoint using '@webcontainer/snapshot'.
   * Refer: https://webcontainers.io/guides/working-with-the-file-system#generating-snapshots
   */
  loadFromSnapshot?: string
  /**
   * Template of shape `FileSystemTree`
   *
   * Refer: Refer: https://webcontainers.io/guides/working-with-the-file-system
   */
  loadFromTemplate?: FileSystemTree
  /**
   * Application theme
   */
  theme: 'light' | 'dark'
  /**
   * Prevents editing the file content.
   */
  editorReadOnly?: boolean
  /**
   * Prevents user input in the terminal.
   */
  terminalReadOnly?: boolean
  /**
   * Hides the terminal UI without preventing the shell from starting.
   */
  hideTerminal?: boolean
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
