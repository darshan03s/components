import { NextRequest, NextResponse } from 'next/server'
import { snapshot } from '@webcontainer/snapshot'
import path from 'node:path'

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams

  const template = searchParams.get('template')

  if (!template) {
    return new NextResponse('Template not provided')
  }

  let sourceFolder = ''

  if (template === 'all') {
    sourceFolder = path.join(process.cwd(), 'templates')
  } else {
    sourceFolder = path.join(process.cwd(), 'templates', template)
  }

  const folderSnapshot = await snapshot(sourceFolder)

  const body = new Uint8Array(folderSnapshot)

  return new NextResponse(body, {
    headers: {
      'Content-Type': 'application/octet-stream'
    }
  })
}
