import { EllipsisVertical, FilePlus, FolderPlus, Pencil, Trash } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

export const FsItemOptions = ({
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
          'ide-file-system-item-options-trigger',
          buttonVariants({ variant: 'ghost', size: 'icon-xs' }),
          'opacity-0 group-hover/fs-item:opacity-100'
        )}
      >
        <EllipsisVertical />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        onClick={(e) => e.stopPropagation()}
        side="left"
        className="ide-file-system-item-options [&_div]:cursor-pointer [&_div]:text-[10px] [&_svg]:size-3!"
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
