import { RefObject } from 'react'
import { useFileSystem, useWebContainer } from '../hooks'
import { getParentFolder } from '../utils'
import { cn } from '@/lib/utils'
import { Item, ItemContent, ItemMedia } from '@/components/ui/item'
import { InputComp } from './input-comp'
import { File, Folder } from 'lucide-react'

export const NewFsItem = ({ inputRef }: { inputRef?: RefObject<HTMLInputElement | null> }) => {
  const { mkDir, writeFile } = useWebContainer()
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
