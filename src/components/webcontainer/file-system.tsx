'use client'

import {
  Check,
  ChevronDown,
  ChevronRight,
  ChevronsDownUp,
  EllipsisVertical,
  EyeOff,
  File,
  FilePlus,
  Folder,
  FolderPlus,
  Pencil,
  Trash,
  X
} from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { RefObject, useEffect, useRef, useState } from 'react'
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
import { ButtonGroup } from '@/components/ui/button-group'

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

const InputComp = ({
  onSubmit,
  onBlur,
  name,
  placeholder,
  defaultValue,
  inputRef
}: {
  onSubmit: (form: HTMLFormElement) => void
  onBlur: () => void
  name: string
  placeholder: string
  defaultValue?: string
  inputRef?: RefObject<HTMLInputElement | null>
}) => {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit(e.currentTarget)
      }}
    >
      <Input
        defaultValue={defaultValue}
        autoFocus
        ref={inputRef}
        onBlur={onBlur}
        name={name}
        className="h-5 text-[10px]! placeholder:text-[10px] focus-visible:ring-0"
        placeholder={placeholder}
      />
    </form>
  )
}

const NewFsItem = ({ inputRef }: { inputRef?: RefObject<HTMLInputElement | null> }) => {
  const { mkDir, writeFile } = useWebcontainer()
  const { newFsItem, setNewFsItem } = useFileSystem()

  async function createNewFsItem(form: HTMLFormElement) {
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
        {newFsItem?.type === 'folder' ? <Folder className="size-3" /> : <File className="size-3" />}
      </ItemMedia>
      <ItemContent>
        <InputComp
          inputRef={inputRef}
          onSubmit={createNewFsItem}
          onBlur={() => setNewFsItem(null)}
          name={newFsItem?.type === 'folder' ? 'folder-name' : 'file-name'}
          placeholder={newFsItem?.type === 'folder' ? 'Enter folder name' : 'Enter file name'}
        />
      </ItemContent>
    </Item>
  )
}

export const FileSystem = () => {
  const { fileSystemOpen, fs, loadFolderItems, newFsItem, setNewFsItem, collapseAllFolders } =
    useFileSystem()
  const { mounted, rootDir, wc } = useWebcontainer()
  const rootDirPath = `/${rootDir}`

  useEffect(() => {
    if (!wc || !mounted) return

    const watcher = wc.fs.watch(rootDirPath, { recursive: true }, (event, fsItem) => {
      if (event === 'rename') {
        const path = `${rootDirPath}/${String(fsItem)}`
        const parentFolder = getParentFolder(path)
        loadFolderItems(parentFolder)
      }
    })

    return () => watcher.close()
  }, [wc, mounted, rootDirPath])

  useEffect(() => {
    if (!mounted) return
    loadFolderItems(rootDirPath)
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
            parent: rootDirPath
          })
        }}
        handleNewFile={() => {
          setNewFsItem({
            type: 'file',
            parent: rootDirPath
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
          {newFsItem?.parent === rootDirPath && <NewFsItem />}
          {fs[rootDirPath] && <FsTree fsItems={fs[rootDirPath]} />}
        </div>
      )}
    </div>
  )
}

const FsItemOptions = ({
  createFolder,
  createFile,
  renameFsItem,
  deleteFsItem,
  onTriggerFocus,
  isFolder
}: {
  createFolder: () => void
  createFile: () => void
  renameFsItem: () => void
  deleteFsItem: () => void
  onTriggerFocus: () => void
  isFolder: boolean
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        onFocus={onTriggerFocus}
        className={cn(
          buttonVariants({ variant: 'ghost', size: 'icon-xs' }),
          'opacity-0 group-hover/fs-item:opacity-100'
        )}
      >
        <EllipsisVertical />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        onClick={(e) => e.stopPropagation()}
        side="left"
        className="[&_div]:cursor-pointer [&_div]:text-[10px] [&_svg]:size-3!"
      >
        <DropdownMenuItem onClick={createFolder} hidden={!isFolder}>
          <FolderPlus /> Create folder
        </DropdownMenuItem>
        <DropdownMenuItem onClick={createFile} hidden={!isFolder}>
          <FilePlus /> Create file
        </DropdownMenuItem>
        <DropdownMenuItem onClick={renameFsItem}>
          <Pencil /> Rename
        </DropdownMenuItem>
        <DropdownMenuItem variant="destructive" onClick={deleteFsItem}>
          <Trash /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function ItemIcon({ item, itemPath }: { item: ReadDirEntry; itemPath: string }) {
  const { isIgnoredPath, isFolderOpen } = useFileSystem()
  if (isIgnoredPath(item.path)) return <EyeOff />

  if (!item.isDirectory()) {
    return <File />
  }

  return isFolderOpen(itemPath) ? <ChevronDown /> : <ChevronRight />
}

const FsItem = ({ item }: { item: ReadDirEntry }) => {
  const { activeFile, rename, rm } = useWebcontainer()
  const { fs, handleFsItemClick, isFolderOpen, setNewFsItem, newFsItem } = useFileSystem()
  const [isRenaming, setIsRenaming] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const itemPath = item.path
  const parentFolder = getParentFolder(itemPath)

  function createFolder() {
    handleFsItemClick(item, true)
    setNewFsItem({
      type: 'folder',
      parent: itemPath
    })
  }

  function createFile() {
    handleFsItemClick(item, true)
    setNewFsItem({
      type: 'file',
      parent: itemPath
    })
  }

  function startRenameFolder() {
    setIsRenaming(true)
  }

  function renameFsItem(form: HTMLFormElement) {
    const formData = new FormData(form)
    const fsItemName = formData.get('new-name')
    const newName = String(fsItemName).trim()
    if (newName === item.name) {
      setIsRenaming(false)
      return
    }
    if (newName.length > 0) {
      rename(itemPath, `${parentFolder}/${newName}`)
      setIsRenaming(false)
    }
  }

  function startDeletingFolder() {
    setIsDeleting(true)
  }

  async function deleteFsItem() {
    await rm(itemPath, { recursive: true })
    setIsDeleting(false)
  }

  const inputRef = useRef<HTMLInputElement | null>(null)

  return (
    <>
      <Item
        size={'xs'}
        className={cn(
          'cursor-pointer p-0 m-0 min-h-6 h-6 px-1 select-none hover:bg-muted group/fs-item',
          activeFile.path === item.path && 'bg-muted'
        )}
        onClick={() => {
          if (isRenaming) return
          handleFsItemClick(item)
        }}
      >
        <ItemMedia className="[&_svg]:size-3!">
          <ItemIcon item={item} itemPath={itemPath} />
        </ItemMedia>
        <ItemContent className="text-xs flex truncate line-clamp-1">
          {isRenaming ? (
            <InputComp
              inputRef={inputRef}
              defaultValue={item.name}
              onSubmit={renameFsItem}
              onBlur={() => setIsRenaming(false)}
              name="new-name"
              placeholder={item.isDirectory() ? 'Enter folder name' : 'Enter file name'}
            />
          ) : (
            item.name
          )}
        </ItemContent>
        <ItemActions>
          {isDeleting ? (
            <ButtonGroup onClick={(e) => e.stopPropagation()}>
              <Button
                variant={'destructive'}
                size={'icon-xs'}
                autoFocus
                onBlur={() => setIsDeleting(false)}
                onClick={deleteFsItem}
              >
                <Check />
              </Button>
              <Button variant={'outline'} size={'icon-xs'} onClick={() => setIsDeleting(false)}>
                <X />
              </Button>
            </ButtonGroup>
          ) : (
            <FsItemOptions
              createFolder={createFolder}
              createFile={createFile}
              renameFsItem={startRenameFolder}
              deleteFsItem={startDeletingFolder}
              onTriggerFocus={() => {
                inputRef.current?.focus()
              }}
              isFolder={item.isDirectory()}
            />
          )}
        </ItemActions>
      </Item>
      {newFsItem?.parent === itemPath && (
        <div className="flex flex-col gap-2 ml-2 pl-2 border-l">
          <NewFsItem inputRef={inputRef} />
        </div>
      )}
      {isFolderOpen(itemPath) && fs[itemPath] && fs[itemPath].length > 0 && (
        <div className="flex flex-col gap-2 ml-2 pl-2 border-l">
          <FsTree fsItems={fs[itemPath]} />
        </div>
      )}
    </>
  )
}

const FsTree = ({ fsItems }: { fsItems: ReadDirEntry[] }) => {
  return (
    <>
      {fsItems.map((item) => (
        <FsItem key={item.path} item={item}></FsItem>
      ))}
    </>
  )
}
