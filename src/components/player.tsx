'use client'

import { Info } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { HoverCard, HoverCardContent, HoverCardTrigger } from './ui/hover-card'

function formatBytes(bytes: number) {
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return (bytes / Math.pow(1024, i)).toFixed(2) + ' ' + sizes[i]
}

const Player = ({ file }: { file: File }) => {
  const videoUrl = URL.createObjectURL(file)

  const hoverCardContentMap = {
    'Last modified': new Date(file.lastModified).toLocaleDateString(),
    Size: formatBytes(file.size),
    Type: file.type
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div></div>
        <CardTitle className="text-center line-clamp-2">{file.name}</CardTitle>
        <HoverCard>
          <HoverCardTrigger className="cursor-pointer hover:opacity-80 transition-opacity duration-200">
            <Info className="size-4" />
          </HoverCardTrigger>
          <HoverCardContent side="bottom" className="w-48">
            <div className="flex flex-col gap-2 text-xs">
              {Object.entries(hoverCardContentMap).map(([key, value]) => (
                <div key={key}>
                  <span className="font-semibold">{key} : </span>
                  <span>{value}</span>
                </div>
              ))}
            </div>
          </HoverCardContent>
        </HoverCard>
      </CardHeader>
      <CardContent>
        <video src={videoUrl} className="aspect-video min-w-100 w-100 rounded-md bg-transparent" />
      </CardContent>
    </Card>
  )
}

export default Player
