'use client'

import { useEffect } from 'react'
import { Spinner } from '@/components/ui/spinner'
import { useFileSystem, useWebContainer } from '../hooks'
import { getParentFolder } from '../utils'
import { FileSystemHeader } from './header'
import { FsTree } from './fs-tree'
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
  const { mounted, rootDir, wc } = useWebContainer()
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
      className="relative flex w-(--fs-width) min-w-(--fs-width) flex-col border-r text-xs"
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
        <div className="flex flex-1 items-center justify-center">
          <Spinner />
        </div>
      ) : (
        <div className="no-scrollbar flex flex-1 flex-col gap-1 overflow-scroll p-1">
          {newFsItem?.parent === rootDirPath && <NewFsItem />}
          {fs[rootDirPath] && <FsTree fsItems={fs[rootDirPath]} />}
          <div
            onDragOver={(e) => {
              e.preventDefault()

              const source = draggedItem.current
              if (!source) return

              setHoveredPath(rootDirPath)
            }}
            onDrop={(e) => {
              e.preventDefault()

              const source = draggedItem.current
              if (!source) return

              handleFsItemDrop(source, rootDirPath)

              endFsItemMove()
            }}
            className="min-h-20 grow"
          ></div>
        </div>
      )}
    </div>
  )
}
