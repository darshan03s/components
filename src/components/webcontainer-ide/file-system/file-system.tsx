'use client'

import { DragEvent, useEffect } from 'react'
import { Spinner } from '@/components/ui/spinner'
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
    setHoveredPath,
    endFsItemMove,
    handleFsItemDrop
  } = useFileSystem()
  const { isMounted, rootDir, wc } = useWebContainer()
  const { disableCreateFolder, disableCreateFile, disableMoving } = useProps()
  const rootDirPath = `/${rootDir}`

  useEffect(() => {
    if (!wc || !isMounted) return

    const watcher = wc.fs.watch(rootDirPath, { recursive: true }, (event, fsItem) => {
      if (event === 'rename') {
        const path = `${rootDirPath}/${String(fsItem)}`
        const parentFolder = getParentFolder(path)
        loadFolderItems(parentFolder)
      }
    })

    return () => watcher.close()
  }, [wc, isMounted, rootDirPath])

  useEffect(() => {
    if (!isMounted) return
    loadFolderItems(rootDirPath)
  }, [isMounted])

  function onDragOver(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()

    const source = draggedItem.current
    if (!source) return

    setHoveredPath(rootDirPath)
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()

    const source = draggedItem.current
    if (!source) return

    handleFsItemDrop(source, rootDirPath)

    endFsItemMove()
  }

  return (
    <div
      className="ide-file-system-container relative flex w-(--fs-width) min-w-(--fs-width) flex-col border-r text-xs"
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
        disableCreateFolder={disableCreateFolder}
        disableCreateFile={disableCreateFile}
      />
      {!isMounted ? (
        <div className="ide-file-system-loading flex flex-1 items-center justify-center">
          <Spinner />
        </div>
      ) : (
        <div className="ide-file-system-tree no-scrollbar flex flex-1 flex-col gap-1 overflow-scroll p-1">
          {newFsItem?.parent === rootDirPath && <NewFsItem />}
          {fs[rootDirPath] && <FsTree fsItems={fs[rootDirPath]} />}
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
