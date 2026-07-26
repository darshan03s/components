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
  FolderPlus,
  Pencil,
  Trash,
  X
} from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { useEffect, useRef, useState } from 'react'
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
  defaultValue
}: {
  onSubmit: (form: HTMLFormElement) => void
  onBlur: () => void
  name: string
  placeholder: string
  defaultValue?: string
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    requestAnimationFrame(() => {
      inputRef.current?.focus()
    })
  }, [])

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit(e.currentTarget)
      }}
    >
      <Input
        defaultValue={defaultValue}
        ref={inputRef}
        onBlur={onBlur}
        name={name}
        className="h-5 text-[10px]! placeholder:text-[10px] focus-visible:ring-0"
        placeholder={placeholder}
      />
    </form>
  )
}

const NewFsItem = () => {
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
        <ChevronRight className="size-3" />
      </ItemMedia>
      <ItemContent>
        <InputComp
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
  createFile,
  renameFolder,
  deleteFolder
}: {
  createFolder: () => void
  createFile: () => void
  renameFolder: () => void
  deleteFolder: () => void
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          buttonVariants({ variant: 'ghost', size: 'icon-xs' }),
          'opacity-0 group-hover/fs-item:opacity-100'
        )}
      >
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
        <DropdownMenuItem onClick={renameFolder}>
          <Pencil /> Rename
        </DropdownMenuItem>
        <DropdownMenuItem variant="destructive" onClick={deleteFolder}>
          <Trash /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function ItemIcon({ item, folderPath }: { item: ReadDirEntry; folderPath: string }) {
  const { isIgnoredPath, isFolderOpen } = useFileSystem()
  if (isIgnoredPath(item.path)) return <EyeOff />

  if (!item.isDirectory()) {
    return <File />
  }

  return isFolderOpen(folderPath) ? <ChevronDown /> : <ChevronRight />
}

const FsItem = ({ item }: { item: ReadDirEntry }) => {
  const { activeFile, rename, rm } = useWebcontainer()
  const { fs, handleFsItemClick, isFolderOpen, setNewFsItem, newFsItem } = useFileSystem()
  const [isRenaming, setIsRenaming] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const folderPath = item.path
  const parentFolder = getParentFolder(folderPath)

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

  function startRenameFolder() {
    setIsRenaming(true)
  }

  function renameFolder(form: HTMLFormElement) {
    const formData = new FormData(form)
    const folderName = formData.get('folder-name')
    const newName = String(folderName).trim()
    if (newName === item.name) {
      setIsRenaming(false)
      return
    }
    if (newName.length > 0) {
      rename(folderPath, `${parentFolder}/${folderName}`)
      setIsRenaming(false)
    }
  }

  function startDeletingFolder() {
    setIsDeleting(true)
  }

  async function deleteFolder() {
    await rm(folderPath, { recursive: true })
    setIsDeleting(false)
  }

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
          <ItemIcon item={item} folderPath={folderPath} />
        </ItemMedia>
        <ItemContent className="text-xs flex truncate line-clamp-1">
          {isRenaming ? (
            <InputComp
              defaultValue={item.name}
              onSubmit={renameFolder}
              onBlur={() => setIsRenaming(false)}
              name="folder-name"
              placeholder="Enter folder name"
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
                onClick={deleteFolder}
              >
                <Check />
              </Button>
              <Button variant={'outline'} size={'icon-xs'} onClick={() => setIsDeleting(false)}>
                <X />
              </Button>
            </ButtonGroup>
          ) : item.isDirectory() ? (
            <FolderOptions
              createFolder={createFolder}
              createFile={createFile}
              renameFolder={startRenameFolder}
              deleteFolder={startDeletingFolder}
            />
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
        <FsItem key={item.path} item={item}></FsItem>
      ))}
    </>
  )
}
