import { useEffect, useRef, useState } from 'react'
import { useFileSystem, useWebcontainer } from '../hooks'
import { FsItemDrag, ReadDirEntry } from '../types'
import { getParentFolder } from '../utils'
import { Item, ItemActions, ItemContent, ItemMedia } from '@/components/ui/item'
import { cn } from '@/lib/utils'
import { FsItemIcon } from './fs-item-icon'
import { InputComp } from './input-comp'
import { ButtonGroup } from '@/components/ui/button-group'
import { Button } from '@/components/ui/button'
import { Check, X } from 'lucide-react'
import { FsItemOptions } from './fs-item-options'
import { NewFsItem } from './new-fs-item'
import { FsTree } from './fs-tree'

export const FsItem = ({ item }: { item: ReadDirEntry }) => {
  const { activeFile, rename, rm } = useWebcontainer()
  const {
    fs,
    handleFsItemClick,
    isFolderOpen,
    setNewFsItem,
    newFsItem,
    hoveredPath,
    setHoveredPath,
    draggedItem,
    openFolder,
    startFsItemMove,
    endFsItemMove,
    handleFsItemDrop
  } = useFileSystem()
  const [isRenaming, setIsRenaming] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const itemPath = item.path
  const type = item.isDirectory() ? 'folder' : 'file'
  const parentFolder = getParentFolder(itemPath)

  useEffect(() => {
    if (hoveredPath !== itemPath) return

    const id = window.setTimeout(() => {
      openFolder(hoveredPath)
    }, 2000)

    return () => clearTimeout(id)
  }, [hoveredPath, openFolder])

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

  function dragOrDropNotAllowed(source: FsItemDrag) {
    if (item.isFile()) return true
    if (source.path === item.path) return true

    return false
  }

  const inputRef = useRef<HTMLInputElement | null>(null)

  return (
    <>
      <Item
        draggable
        onDragStart={() => {
          startFsItemMove({
            name: item.name,
            path: itemPath,
            type
          })
        }}
        onDragOver={(e) => {
          e.preventDefault()
          e.stopPropagation()

          const source = draggedItem.current
          if (!source) return

          if (dragOrDropNotAllowed(source)) return

          setHoveredPath(itemPath)
        }}
        onDragLeave={() => {
          setHoveredPath((path) => (path === itemPath ? null : path))
        }}
        onDragEnd={() => {
          endFsItemMove()
        }}
        onDrop={(e) => {
          e.preventDefault()
          e.stopPropagation()

          const source = draggedItem.current
          if (!source) return

          if (dragOrDropNotAllowed(source)) return

          handleFsItemDrop(source, itemPath)

          endFsItemMove()
        }}
        size={'xs'}
        className={cn(
          'cursor-pointer p-0 m-0 min-h-6 h-6 px-1 select-none hover:bg-muted group/fs-item',
          activeFile.path === itemPath && 'bg-muted',
          hoveredPath === itemPath && 'ring-1'
        )}
        onClick={() => {
          if (isRenaming) return
          handleFsItemClick(item)
        }}
      >
        <ItemMedia className="[&_svg]:size-3!">
          <FsItemIcon item={item} itemPath={itemPath} />
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
        <div className="ml-2 pl-2 border-l">
          <NewFsItem inputRef={inputRef} />
        </div>
      )}
      {isFolderOpen(itemPath) && fs[itemPath] && fs[itemPath].length > 0 && (
        <div className="flex flex-col gap-1 ml-2 pl-2 border-l">
          <FsTree fsItems={fs[itemPath]} />
        </div>
      )}
    </>
  )
}
