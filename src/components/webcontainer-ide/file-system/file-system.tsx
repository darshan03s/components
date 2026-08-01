'use client'

import { DragEvent, useEffect } from 'react'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'
import { useFileSystem, useProps, useWebContainer } from '../hooks'
import { getParentFolder } from '../utils'
import { FsTree } from './fs-tree'
import { FileSystemHeader } from './header'
import { NewFsItem } from './new-fs-item'

export const FileSystem = () => {
  const {
    fileSystemOpen,
    fs,
    loadFolderItems,
    newFsItem,
    setNewFsItem,
    collapseAllFolders,
    draggedItem,
    hoveredPath,
    setHoveredPath,
    endFsItemMove,
    handleFsItemDrop
  } = useFileSystem()
  const { isMounted, rootDir, wc } = useWebContainer()
  const { disableCreateFolder, disableCreateFile, disableMoving } = useProps()

  useEffect(() => {
    if (!wc || !isMounted) return

    const watcher = wc.fs.watch('/', { recursive: true }, (event, fsItem) => {
      if (event === 'rename') {
        const parentFolder = getParentFolder(String(fsItem))
        loadFolderItems(parentFolder)
      }
    })

    return () => watcher.close()
  }, [wc, isMounted])

  useEffect(() => {
    if (!isMounted) return
    loadFolderItems('/')
  }, [isMounted])

  function onDragOver(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()

    const source = draggedItem.current
    if (!source) return

    setHoveredPath('/')
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()

    const source = draggedItem.current
    if (!source) return

    handleFsItemDrop(source, '/')

    endFsItemMove()
  }

  return (
    <div
      className={cn(
        'ide-file-system-container relative flex w-(--fs-width) min-w-(--fs-width) flex-col border-r text-xs',
        hoveredPath === '/' && 'ring-1 ring-ring'
      )}
      hidden={!fileSystemOpen}
    >
      <FileSystemHeader
        rootDir={rootDir}
        handleNewFolder={() => {
          setNewFsItem({
            type: 'folder',
            parent: '/'
          })
        }}
        handleNewFile={() => {
          setNewFsItem({
            type: 'file',
            parent: '/'
          })
        }}
        handleCollapseAll={collapseAllFolders}
        disableCreateFolder={disableCreateFolder}
        disableCreateFile={disableCreateFile}
      />
      {!isMounted ? (
        <div className="ide-file-system-loading flex flex-1 items-center justify-center">
          <Spinner />
        </div>
      ) : (
        <div className="ide-file-system-tree no-scrollbar flex flex-1 flex-col gap-1 overflow-scroll p-1">
          {newFsItem?.parent === '/' && <NewFsItem />}
          {fs['/'] && <FsTree fsItems={fs['/']} />}
          <div
            onDragOver={!disableMoving ? onDragOver : undefined}
            onDrop={!disableMoving ? onDrop : undefined}
            className="ide-file-system-root-dropzone min-h-20 grow"
          ></div>
        </div>
      )}
    </div>
  )
}
