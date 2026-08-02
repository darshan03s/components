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
  /**
   * Disables folder creation in the UI.
   */
  disableCreateFolder?: boolean
  /**
   * Disables file creation in the UI.
   */
  disableCreateFile?: boolean
  /**
   * Disables file and folder renaming in the UI
   */
  disableRenaming?: boolean
  /**
   * Disables file and folder deleting in the UI
   */
  disableDeleting?: boolean
  /**
   * Disables file and folder moving in the UI
   */
  disableMoving?: boolean
  /**
   * Opens terminal on load
   */
  openTerminal?: boolean
  /**
   * Called after a rename event from the WebContainer file system.
   */
  onRenameEvent?: (fsItem: string) => void

  /**
   * Called after a change event from the WebContainer file system.
   */
  onChangeEvent?: (fsItem: string) => void
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
