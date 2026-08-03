'use client'

import axios from 'axios'
import { useTheme } from 'next-themes'
import { IGNORED_FOLDERS, WebContainerIDE, useWebContainer } from '@/components/webcontainer-ide'

export const Client = ({ template }: { template: string }) => {
  const { resolvedTheme } = useTheme()
  const { wc } = useWebContainer()

  async function onChange() {
    const snapshot = await wc?.export('', {
      excludes: [...IGNORED_FOLDERS],
      format: 'binary'
    })

    const snapshotCopy = new Uint8Array(snapshot!)

    const blob = new Blob([snapshotCopy], {
      type: 'application/octet-stream'
    })

    const formData = new FormData()

    formData.append('template', template)
    formData.append('snapshot', blob, 'snapshot.bin')

    await axios.post('/api/snapshot', formData)
  }

  return (
    <WebContainerIDE
      key={template}
      loadFromSnapshot={`/api/snapshot?template=${template}`}
      editorTheme={resolvedTheme as 'light' | 'dark'}
    />
  )
}
