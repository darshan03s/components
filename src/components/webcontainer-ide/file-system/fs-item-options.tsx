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
  disableCreateFolder,
  disableCreateFile,
  disableRenaming,
  disableDeleting,
  createFolder,
  createFile,
  renameFsItem,
  deleteFsItem,
  onTriggerFocus,
  isFolder
}: {
  disableCreateFolder: boolean | undefined
  disableCreateFile: boolean | undefined
  disableRenaming: boolean | undefined
  disableDeleting: boolean | undefined
  createFolder: () => void
  createFile: () => void
  renameFsItem: () => void
  deleteFsItem: () => void
  onTriggerFocus: () => void
  isFolder: boolean
}) => {
  if (isFolder && disableCreateFile && disableCreateFolder && disableRenaming && disableDeleting) {
    return null
  }

  if (!isFolder && disableRenaming && disableDeleting) {
    return null
  }

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
        {!disableCreateFolder && (
          <DropdownMenuItem onClick={createFolder} hidden={!isFolder}>
            <FolderPlus /> Create folder
          </DropdownMenuItem>
        )}
        {!disableCreateFile && (
          <DropdownMenuItem onClick={createFile} hidden={!isFolder}>
            <FilePlus /> Create file
          </DropdownMenuItem>
        )}
        {!disableRenaming && (
          <DropdownMenuItem onClick={renameFsItem}>
            <Pencil /> Rename
          </DropdownMenuItem>
        )}
        {!disableDeleting && (
          <DropdownMenuItem variant="destructive" onClick={deleteFsItem}>
            <Trash /> Delete
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
