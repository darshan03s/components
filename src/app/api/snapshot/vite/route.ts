import path from 'node:path'
import { snapshot } from '@webcontainer/snapshot'
import { NextResponse } from 'next/server'

export async function GET() {
  const sourceFolder = path.join(process.cwd(), 'templates', 'vite')

  const folderSnapshot = await snapshot(sourceFolder)

  const body = new Uint8Array(folderSnapshot)

  return new NextResponse(body, {
    headers: {
      'Content-Type': 'application/octet-stream'
    }
  })
}
