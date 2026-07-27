import { promises as fs } from 'node:fs'
import path from 'node:path'

type FileNode = {
  file: {
    contents: string
  }
}

type DirectoryNode = {
  directory: Record<string, FileNode | DirectoryNode>
}

async function buildTree(dir: string): Promise<Record<string, FileNode | DirectoryNode>> {
  const entries = await fs.readdir(dir, { withFileTypes: true })

  const result: Record<string, FileNode | DirectoryNode> = {}

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)

    if (entry.isDirectory()) {
      result[entry.name] = {
        directory: await buildTree(fullPath)
      }
    } else if (entry.isFile()) {
      const contents = await fs.readFile(fullPath, 'utf8')

      result[entry.name] = {
        file: {
          contents
        }
      }
    }
  }

  return result
}

async function main() {
  const input = process.argv[2]

  if (!input) {
    console.error('Usage: tsx generate-files-json.ts <folder>')
    process.exit(1)
  }

  const absolutePath = path.resolve(input)

  const files = await buildTree(absolutePath)

  await fs.writeFile('template.json', JSON.stringify(files, null, 2), 'utf8')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
