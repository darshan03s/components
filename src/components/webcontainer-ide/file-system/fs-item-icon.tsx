import { ChevronDown, ChevronRight, EyeOff, File } from 'lucide-react'
import { useFileSystem } from '../hooks'
import { ReadDirEntry } from '../types'

export function FsItemIcon({ item, itemPath }: { item: ReadDirEntry; itemPath: string }) {
  const { isIgnoredPath, isFolderOpen } = useFileSystem()
  if (isIgnoredPath(item.path)) return <EyeOff />

  if (!item.isDirectory()) {
    return <File />
  }

  return isFolderOpen(itemPath) ? <ChevronDown /> : <ChevronRight />
}
