'use client'

import { ALL_FORMATS, BlobSource, Input, InputAudioTrack, MetadataTags } from 'mediabunny'

export type InputFileData = {
  audioTracks: InputAudioTrack[]
  duration: number
  computedDuration: number
  format: {
    name: string
    mimeType: string
  }
  metadataTags: MetadataTags
  mimeType: string
  size: number | null
}

export async function getFileData(file: File): Promise<InputFileData> {
  const input = new Input({
    formats: ALL_FORMATS,
    source: new BlobSource(file)
  })

  let data = {}

  const [audioTracks, duration, format, metadataTags, mimeType, size] = await Promise.all([
    input.getAudioTracks(),
    input.getDurationFromMetadata(),
    input.getFormat(),
    input.getMetadataTags(),
    input.getMimeType(),
    input.source.getSizeOrNull()
  ])

  const computedDuration = await input.computeDuration()

  data = {
    audioTracks,
    duration,
    computedDuration,
    format: { name: format.name, mimeType: format.mimeType },
    metadataTags,
    mimeType,
    size
  }

  return data as InputFileData
}
