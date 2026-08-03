import { NextRequest, NextResponse } from 'next/server'
import { snapshot } from '@webcontainer/snapshot'
import { access, mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams

  const template = searchParams.get('template')

  if (!template) {
    return new NextResponse('Template not provided', { status: 400 })
  }

  const snapshotPath = path.join(process.cwd(), 'snapshots', `${template}.bin`)

  try {
    await access(snapshotPath)

    const body = await readFile(snapshotPath)

    return new NextResponse(body, {
      headers: {
        'Content-Type': 'application/octet-stream'
      }
    })
  } catch {
    // Snapshot doesn't exist. Fall back to generating one.
  }

  const sourceFolder =
    template === 'all'
      ? path.join(process.cwd(), 'templates')
      : path.join(process.cwd(), 'templates', template)

  const folderSnapshot = await snapshot(sourceFolder)

  return new NextResponse(new Uint8Array(folderSnapshot), {
    headers: {
      'Content-Type': 'application/octet-stream'
    }
  })
}

export async function POST(req: NextRequest) {
  const formData = await req.formData()

  const template = formData.get('template') as string
  const snapshot = formData.get('snapshot') as File

  const buffer = Buffer.from(await snapshot.arrayBuffer())

  const snapshotsDir = path.join(process.cwd(), 'snapshots')
  await mkdir(snapshotsDir, { recursive: true })

  const filePath = path.join(snapshotsDir, `${template}.bin`)
  await writeFile(filePath, buffer)

  return NextResponse.json({ success: true })
}
