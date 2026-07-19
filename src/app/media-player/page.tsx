'use client'
import { MediaPlayer } from '@/components/media-player'

import Main from '@/components/main'
import FileImport from '@/components/file-import'
import { useState } from 'react'
import './styles.css'
import { ReactScan } from '@/components/react-scan'

const Page = () => {
  const [file, setFile] = useState<File | null>(null)

  return (
    <Main className="flex items-center justify-center ">
      <div>
        {!file ? <FileImport setFile={setFile} /> : <MediaPlayer file={file} showFileName={true} />}
      </div>
      <ReactScan />
    </Main>
  )
}

export default Page
