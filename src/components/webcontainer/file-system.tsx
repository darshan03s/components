'use client'

import { ChevronDown, ChevronRight, File, FilePlus, FolderPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useEffect } from 'react'
import { Item, ItemContent, ItemMedia, ItemTitle } from '@/components/ui/item'
import { ReadDirEntry } from './types'
import { cn } from '@/lib/utils'
import { Spinner } from '@/components/ui/spinner'
import { useFileSystem, useWebcontainer } from './hooks'

const FileSystemHeader = ({ rootDir }: { rootDir: string }) => {
  return (
    <div className="filesystem-header h-(--inner-header-height) min-h-(--inner-header-height) px-2 border-b bg-background z-10 flex items-center justify-between">
      <div className="flex items-center gap-1">
        <span className="font-semibold">{rootDir}</span>
      </div>
      <div className="flex items-center">
        <Button variant={'ghost'} size={'icon-xs'} title="Add file">
          <FilePlus />
        </Button>
        <Button variant={'ghost'} size={'icon-xs'} title="Add folder">
          <FolderPlus />
        </Button>
      </div>
    </div>
  )
}

export const FileSystem = () => {
  const { fileSystemOpen, fs, loadFolderItems } = useFileSystem()
  const { mounted, rootDir, wc } = useWebcontainer()
  const folderPath = `/${rootDir}`

  function getParentFolder(path: string): string {
    const normalized = path.replace(/\/+$/, '')

    const lastSlash = normalized.lastIndexOf('/')

    if (lastSlash <= 0) {
      return '/'
    }

    return normalized.slice(0, lastSlash)
  }

  useEffect(() => {
    if (!wc || !mounted) return

    const watcher = wc.fs.watch(folderPath, { recursive: true }, (event, fsItem) => {
      if (event === 'rename') {
        const path = `${folderPath}/${String(fsItem)}`
        const parentFolder = getParentFolder(path)
        loadFolderItems(parentFolder)
      }
    })

    return () => watcher.close()
  }, [wc, mounted, folderPath])

  useEffect(() => {
    if (!mounted) return
    loadFolderItems(folderPath)
  }, [mounted])

  return (
    <div
      className="w-(--fs-width) min-w-(--fs-width) border-r text-xs relative flex flex-col"
      hidden={!fileSystemOpen}
    >
      <FileSystemHeader rootDir={rootDir} />
      {!mounted ? (
        <div className="flex-1 flex items-center justify-center">
          <Spinner />
        </div>
      ) : (
        <div className="flex-1 flex flex-col gap-2 p-1 overflow-scroll no-scrollbar">
          {fs[folderPath] && <FsTree fsItems={fs[folderPath]} />}
        </div>
      )}
    </div>
  )
}

const FsItem = ({ item }: { item: ReadDirEntry }) => {
  const { activeFile } = useWebcontainer()
  const { fs, handleFsItemClick, isFolderOpen } = useFileSystem()
  const folderPath = item.path

  return (
    <>
      <Item
        size={'xs'}
        className={cn(
          'cursor-pointer p-0 m-0 min-h-6 h-6 px-1 select-none hover:bg-muted',
          activeFile.path === item.path && 'bg-muted'
        )}
        onClick={() => handleFsItemClick(item)}
      >
        <ItemMedia>
          {item.isDirectory() ? (
            isFolderOpen(folderPath) ? (
              <ChevronDown className="size-3" />
            ) : (
              <ChevronRight className="size-3" />
            )
          ) : (
            <File className="size-3" />
          )}
        </ItemMedia>
        <ItemContent>
          <ItemTitle className="text-xs">{item.name}</ItemTitle>
        </ItemContent>
      </Item>
      {isFolderOpen(folderPath) && fs[folderPath] && fs[folderPath].length > 0 && (
        <div className="flex flex-col gap-2 ml-2 pl-2 border-l">
          <FsTree fsItems={fs[folderPath]} />
        </div>
      )}
    </>
  )
}

const FsTree = ({ fsItems }: { fsItems: ReadDirEntry[] }) => {
  return (
    <>
      {fsItems.map((item) => (
        <FsItem
          key={`${item.name}-${String(item.isFile)}-${String(item.isDirectory)}`}
          item={item}
        ></FsItem>
      ))}
    </>
  )
}
