'use client'

import { memo, useState } from 'react'
import {
  EllipsisVertical,
  FastForward,
  Image as ImageIcon,
  Info,
  Maximize,
  Music,
  Pause,
  Play,
  Rewind,
  Volume2,
  VolumeX
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import { InfoModal } from './info-modal'
import { PlayerProvider, usePlayerPlaybackContext, usePlayerStaticContext } from './provider'
import { formatDuration } from './utils'

type MediaPlayerProps = {
  file: File
  showHTMLControls?: boolean
  showFileName?: boolean
  className?: string
}

export const MediaPlayer = ({
  file,
  showHTMLControls,
  showFileName,
  className
}: MediaPlayerProps) => {
  return (
    <PlayerProvider file={file} showHTMLControls={showHTMLControls} showFileName={showFileName}>
      <PlayerMain className={className} />
    </PlayerProvider>
  )
}

const PlayerMain = ({ className }: { className?: string }) => {
  const { fileData } = usePlayerStaticContext()

  return (
    <Card className={cn('relative w-86 max-w-full gap-0 overflow-hidden p-0 md:w-120', className)}>
      {!fileData ? (
        <div className="bg-muted absolute inset-0 animate-pulse" />
      ) : (
        <>
          <Poster />
          <Video />
          <PlayerFooter />
        </>
      )}
    </Card>
  )
}

const Poster = memo(function Poster() {
  const { posterUrl } = usePlayerStaticContext()

  if (!posterUrl) return null

  return (
    <img
      data-posterimage
      width={100}
      height={100}
      src={posterUrl}
      alt="Poster"
      className="absolute inset-0 h-full w-full"
    />
  )
})

const Video = memo(function Video() {
  const { videoRef, showHTMLControls, posterUrl, videoUrl, setIsPlaying, type, playPause } =
    usePlayerStaticContext()

  return (
    <CardContent className="relative aspect-video p-0" onClick={playPause}>
      {type === 'audio' && !posterUrl && (
        <div className="from-primary/10 absolute inset-0 flex items-center justify-center bg-linear-to-b to-transparent">
          <Music className="text-primary size-14" />
        </div>
      )}
      <video
        data-video
        ref={videoRef}
        controls={showHTMLControls}
        poster={posterUrl}
        src={videoUrl}
        className="h-full w-full"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
      />
    </CardContent>
  )
})

const PlayerFooter = memo(function PlayerFooter() {
  const { posterUrl, showFileName } = usePlayerStaticContext()

  return (
    <CardFooter
      className={cn(
        'relative flex w-full min-w-0 flex-col gap-2 overflow-hidden border-none',
        posterUrl ? 'bg-black/30 backdrop-blur-md' : 'bg-background',
        !posterUrl ? '**:data-time:text-foreground' : '**:data-time:text-white',
        '**:data-playpause:text-primary-foreground **:data-playpause:bg-primary/80',
        '**:data-controls-right:text-primary-foreground **:data-controls-right:bg-primary/80',
        !posterUrl ? '**:data-filename:text-foreground' : '**:data-filename:text-white',
        !posterUrl
          ? '**:data-seek:bg-muted **:data-seek:text-muted-foreground'
          : '**:data-seek:bg-primary/20 **:data-seek:text-primary-foreground',
        "**:data-[slot='slider-track']:bg-primary/30 **:data-[slot='slider-track']:cursor-pointer",
        "**:data-[slot='slider-range']:bg-primary/80"
      )}
    >
      <Controls />
      <ProgressBar />
      {showFileName && <FileName />}
    </CardFooter>
  )
})

const Controls = () => {
  const { playPause, handleMute, handleCapture, type, handleRewind, handleFastForward } =
    usePlayerStaticContext()
  const { currentTime, duration, isPlaying, isMuted } = usePlayerPlaybackContext()

  const rightControls = [
    {
      id: 'mute',
      icon: isMuted ? <VolumeX className="size-3" /> : <Volume2 className="size-3" />,
      onClick: handleMute,
      title: 'Mute/Unmute'
    },
    {
      id: 'capture',
      icon: <ImageIcon className="size-3" />,
      onClick: handleCapture,
      title: 'Capture frame'
    }
  ]

  return (
    <div className="grid w-full grid-cols-3 font-sans text-xs">
      <span data-time className="flex items-center">
        {formatDuration(currentTime)} / {formatDuration(duration)}
      </span>
      <span className="flex items-center justify-center gap-2">
        <Button data-seek title="Rewind" size="icon-xs" onClick={handleRewind}>
          <Rewind className="size-3" />
        </Button>
        <Button data-playpause size="icon-xs" onClick={playPause} title="Play/Pause">
          {isPlaying ? <Pause className="size-3" /> : <Play className="size-3" />}
        </Button>
        <Button data-seek title="Fast Forward" size="icon-xs" onClick={handleFastForward}>
          <FastForward className="size-3" />
        </Button>
      </span>
      <div className="flex items-center justify-end gap-2">
        {rightControls.map((control) => {
          if (type === 'audio' && control.id === 'capture') {
            return null
          }
          return (
            <Button
              key={control.id}
              data-controls-right
              size="icon-xs"
              onClick={control.onClick}
              title={control.title}
              className={`${control.id === 'capture' && 'hidden md:inline-flex'}`}
            >
              {control.icon}
            </Button>
          )
        })}
        <MoreControls>
          <Button data-controls-right size="icon-xs" title="More controls">
            <EllipsisVertical className="size-3" />
          </Button>
        </MoreControls>
      </div>
    </div>
  )
}

const MoreControls = ({ children }: { children: React.ReactNode }) => {
  const { handleMaximize, handleCapture } = usePlayerStaticContext()
  const [infoOpen, setInfoOpen] = useState(false)

  const moreControls = [
    {
      id: 'info',
      icon: <Info className="size-3" />,
      label: 'Info',
      title: 'Show info'
    },
    {
      id: 'capture',
      icon: <ImageIcon className="size-3" />,
      onClick: handleCapture,
      label: 'Capture',
      title: 'Capture frame'
    },
    {
      id: 'maximize',
      icon: <Maximize className="size-3" />,
      onClick: handleMaximize,
      label: 'Maximize',
      title: 'Maximize player'
    }
  ]

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
        <DropdownMenuContent side="top" align="end" className="p-2">
          <DropdownMenuGroup className="space-y-1">
            {moreControls.map((control) => {
              if (control.id === 'info') {
                return (
                  <DropdownMenuItem
                    key={control.id}
                    className="cursor-pointer text-xs"
                    onSelect={() => setInfoOpen(true)}
                    title={control.title}
                  >
                    {control.icon} {control.label}
                  </DropdownMenuItem>
                )
              }
              return (
                <DropdownMenuItem
                  key={control.id}
                  className={`cursor-pointer text-xs ${control.id === 'capture' && 'inline-flex md:hidden'}`}
                  onClick={control.onClick}
                  title={control.title}
                >
                  {control.icon} {control.label}
                </DropdownMenuItem>
              )
            })}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <InfoModal open={infoOpen} onOpenChange={setInfoOpen} />
    </>
  )
}

const ProgressBar = () => {
  const { sliderOnValueChange } = usePlayerStaticContext()
  const { progress } = usePlayerPlaybackContext()

  return (
    <Slider
      value={[progress]}
      max={100}
      onValueChange={sliderOnValueChange}
      className="w-full flex-1"
    />
  )
}

const FileName = memo(function FileName() {
  const { fileData, file } = usePlayerStaticContext()

  const fileName = fileData?.metadataTags.title || file.name

  return (
    <span data-filename className="w-full min-w-0 truncate text-center text-xs" title={fileName}>
      {fileName}
    </span>
  )
})
