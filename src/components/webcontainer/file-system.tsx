'use client'

import {
  ChevronDown,
  ChevronRight,
  ChevronsDownUp,
  EllipsisVertical,
  File,
  FilePlus,
  FolderPlus
} from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { useEffect, useRef } from 'react'
import { Item, ItemActions, ItemContent, ItemMedia } from '@/components/ui/item'
import { ReadDirEntry } from './types'
import { cn } from '@/lib/utils'
import { Spinner } from '@/components/ui/spinner'
import { Input } from '@/components/ui/input'
import { useFileSystem, useWebcontainer } from './hooks'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

function getParentFolder(path: string): string {
  const normalized = path.replace(/\/+$/, '')

  const lastSlash = normalized.lastIndexOf('/')

  if (lastSlash <= 0) {
    return '/'
  }

  return normalized.slice(0, lastSlash)
}

const FileSystemHeader = ({
  rootDir,
  handleNewFolder,
  handleNewFile,
  handleCollapseAll
}: {
  rootDir: string
  handleNewFolder: () => void
  handleNewFile: () => void
  handleCollapseAll: () => void
}) => {
  return (
    <div className="filesystem-header h-(--inner-header-height) min-h-(--inner-header-height) px-2 border-b bg-background z-10 flex items-center justify-between">
      <div className="flex items-center gap-1">
        <span className="font-semibold">{rootDir}</span>
      </div>
      <div className="flex items-center">
        <Button variant={'ghost'} size={'icon-xs'} title="Collapse all" onClick={handleCollapseAll}>
          <ChevronsDownUp />
        </Button>
        <Button variant={'ghost'} size={'icon-xs'} title="Add file" onClick={handleNewFile}>
          <FilePlus />
        </Button>
        <Button variant={'ghost'} size={'icon-xs'} title="Add folder" onClick={handleNewFolder}>
          <FolderPlus />
        </Button>
      </div>
    </div>
  )
}

const NewFsItem = () => {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const { mkDir, writeFile } = useWebcontainer()
  const { newFsItem, setNewFsItem } = useFileSystem()

  useEffect(() => {
    requestAnimationFrame(() => {
      inputRef.current?.focus()
    })
  }, [])

  async function onSubmit(form: HTMLFormElement) {
    const formData = new FormData(form)
    const folderName = formData.get('folder-name')
    const fileName = formData.get('file-name')

    if (folderName && String(folderName).trim().length > 0) {
      const path = `${newFsItem?.parent}/${String(folderName)}`
      await mkDir(path, { recursive: true })
      setNewFsItem(null)
    } else if (fileName) {
      const path = `${newFsItem?.parent}/${String(fileName)}`
      const parent = getParentFolder(path)
      await mkDir(parent, { recursive: true })
      await writeFile(path, '')
      setNewFsItem(null)
    }
  }

  return (
    <Item size={'xs'} className={cn('cursor-pointer p-0 m-0 min-h-6 h-6 px-1 select-none')}>
      <ItemMedia>
        <ChevronRight className="size-3" />
      </ItemMedia>
      <ItemContent>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            onSubmit(e.currentTarget)
          }}
        >
          <Input
            ref={inputRef}
            onBlur={() => setNewFsItem(null)}
            name={newFsItem?.type === 'folder' ? 'folder-name' : 'file-name'}
            className="h-5 text-[10px]! placeholder:text-[10px] focus-visible:ring-0"
            placeholder={newFsItem?.type === 'folder' ? 'Enter folder name' : 'Enter file name'}
          />
        </form>
      </ItemContent>
    </Item>
  )
}

export const FileSystem = () => {
  const { fileSystemOpen, fs, loadFolderItems, newFsItem, setNewFsItem, collapseAllFolders } =
    useFileSystem()
  const { mounted, rootDir, wc } = useWebcontainer()
  const folderPath = `/${rootDir}`

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
      <FileSystemHeader
        rootDir={rootDir}
        handleNewFolder={() => {
          setNewFsItem({
            type: 'folder',
            parent: folderPath
          })
        }}
        handleNewFile={() => {
          setNewFsItem({
            type: 'file',
            parent: folderPath
          })
        }}
        handleCollapseAll={collapseAllFolders}
      />
      {!mounted ? (
        <div className="flex-1 flex items-center justify-center">
          <Spinner />
        </div>
      ) : (
        <div className="flex-1 flex flex-col gap-2 p-1 overflow-scroll no-scrollbar">
          {newFsItem?.parent === folderPath && <NewFsItem />}
          {fs[folderPath] && <FsTree fsItems={fs[folderPath]} />}
        </div>
      )}
    </div>
  )
}

const FolderOptions = ({
  createFolder,
  createFile
}: {
  createFolder: () => void
  createFile: () => void
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={cn(buttonVariants({ variant: 'ghost', size: 'icon-xs' }))}>
        <EllipsisVertical />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        onCloseAutoFocus={(e) => e.preventDefault()}
        onClick={(e) => e.stopPropagation()}
        side="left"
        className="[&_div]:cursor-pointer [&_div]:text-[10px] [&_svg]:size-3!"
      >
        <DropdownMenuItem onClick={createFolder}>
          <FolderPlus /> Create folder
        </DropdownMenuItem>
        <DropdownMenuItem onClick={createFile}>
          <FilePlus /> Create file
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

const FsItem = ({ item }: { item: ReadDirEntry }) => {
  const { activeFile } = useWebcontainer()
  const { fs, handleFsItemClick, isFolderOpen, setNewFsItem, newFsItem } = useFileSystem()
  const folderPath = item.path

  function createFolder() {
    handleFsItemClick(item, true)
    setNewFsItem({
      type: 'folder',
      parent: folderPath
    })
  }

  function createFile() {
    handleFsItemClick(item, true)
    setNewFsItem({
      type: 'file',
      parent: folderPath
    })
  }

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
        <ItemContent className="text-xs flex truncate line-clamp-1">{item.name}</ItemContent>
        <ItemActions>
          {item.isDirectory() ? (
            <FolderOptions createFolder={createFolder} createFile={createFile} />
          ) : (
            <></>
          )}
        </ItemActions>
      </Item>
      {newFsItem?.parent === folderPath && (
        <div className="flex flex-col gap-2 ml-2 pl-2 border-l">
          <NewFsItem />
        </div>
      )}
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
          key={`${item.name}-${String(item.isFile())}-${String(item.isDirectory())}`}
          item={item}
        ></FsItem>
      ))}
    </>
  )
}
