import { ChevronsDownUp, FilePlus, FolderPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const FileSystemHeader = ({
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
    <div className="filesystem-header bg-background z-10 flex h-(--inner-header-height) min-h-(--inner-header-height) items-center justify-between border-b px-2">
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
