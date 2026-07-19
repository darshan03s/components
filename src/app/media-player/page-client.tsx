'use client'

import FileImport from '@/components/file-import'
import Main from '@/components/main'
import { MediaPlayer } from '@/components/media-player'
import { useState } from 'react'

const PageClient = () => {
  const [file, setFile] = useState<File | null>(null)

  return (
    <Main className="flex items-center justify-center ">
      <div>
        {!file ? <FileImport setFile={setFile} /> : <MediaPlayer file={file} showFileName={true} />}
      </div>
    </Main>
  )
}

export default PageClient
