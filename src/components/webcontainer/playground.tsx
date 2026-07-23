'use client'

import { useWebcontainerContext, WebcontainerProvider } from './webcontainer-provider'
import { FileSystem } from './file-system'
import { FileSystemProvider } from './filesystem-provider'
import Main from './main'
import { useEffect } from 'react'

type PlaygroundProps = {
  loadFromSnapshot?: string
  rootDir?: string
}

export const Playground = ({ ...props }: PlaygroundProps) => {
  return (
    <WebcontainerProvider rootDir={props.rootDir}>
      <Comp {...props} />
    </WebcontainerProvider>
  )
}

const Comp = ({ loadFromSnapshot }: PlaygroundProps) => {
  const { init } = useWebcontainerContext()

  useEffect(() => {
    init(loadFromSnapshot)
  }, [])

  return (
    <div className="w-240 h-140 border rounded-lg flex flex-col">
      <div className="bg-background rounded-tl-lg rounded-tr-lg h-10 px-2 flex items-center border-b"></div>
      <div className="flex flex-1 overflow-scroll no-scrollbar">
        <FileSystemProvider>
          <FileSystem />
          <Main />
        </FileSystemProvider>
      </div>
    </div>
  )
}
