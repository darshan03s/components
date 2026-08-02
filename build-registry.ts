import { execSync } from 'node:child_process'
import fs, { readFileSync } from 'node:fs'
import path from 'node:path'

const registryFilePath = './registry.json'
const registryName = 'registry'
const registryHost = 'https://components.darshans.site'

const webContainerIdeDocs = readFileSync('./src/docs/webcontainer-ide.md', 'utf-8')

const registryItems: RegistryItem[] = [
  {
    name: 'media-player',
    type: 'registry:block',
    title: 'Media Player',
    description: 'A media player component for audio and video files',
    registryDependencies: ['button', 'dialog', 'item', 'card', 'dropdown-menu', 'slider'],
    dependencies: ['mediabunny@^1.50.6'],
    files: [
      {
        path: 'src/components/media-player/*',
        type: 'registry:component',
        target: '@components/media-player/'
      }
    ]
  },
  {
    name: 'webcontainer-ide',
    type: 'registry:block',
    title: 'WebContainer IDE',
    description: 'WebContainer based IDE',
    docs: webContainerIdeDocs,
    registryDependencies: [
      'button',
      'button-group',
      'item',
      'spinner',
      'dropdown-menu',
      'slider',
      'input',
      'resizable'
    ],
    dependencies: [
      '@webcontainer/api',
      '@uiw/react-codemirror',
      '@uiw/codemirror-theme-vscode',
      '@codemirror/lang-javascript',
      '@codemirror/lang-json',
      '@codemirror/lang-html',
      '@codemirror/lang-sass',
      '@codemirror/lang-css',
      '@xterm/xterm',
      '@xterm/addon-fit'
    ],
    files: [
      {
        path: 'src/components/webcontainer-ide/*',
        type: 'registry:component',
        target: '@components/webcontainer-ide/'
      }
    ]
  }
]

const postBuild = true

type RegistryItemType =
  | 'registry:base'
  | 'registry:block'
  | 'registry:component'
  | 'registry:font'
  | 'registry:lib'
  | 'registry:hook'
  | 'registry:ui'
  | 'registry:page'
  | 'registry:file'
  | 'registry:style'
  | 'registry:theme'
  | 'registry:block'

type RegistryItemFile = {
  path: string
  type: RegistryItemType
  target: string
}

type RegistryItem = {
  name: string
  type: RegistryItemType
  title: string
  author?: string
  description?: string
  docs?: string
  registryDependencies?: string[]
  dependencies?: string[]
  devDependencies?: string[]
  files?: RegistryItemFile[]
}

type RegistryItemCssVars = {
  [key: string]: string | RegistryItemCssVars
}

type RegistryItemCss = {
  [key: string]: string | RegistryItemCss
}

type RegistryItemEnvVars = {
  [key: string]: string
}

type RegistryItemFont =
  | 'family'
  | 'provider'
  | 'import'
  | 'variable'
  | 'weight'
  | 'subsets'
  | 'selector'
  | 'dependency'

type Registry = {
  $schema: string
  name: string
  homepage: string
  items: RegistryItem[]
  include?: string[]
  cssVars?: RegistryItemCssVars
  css?: RegistryItemCss
  envVars?: RegistryItemEnvVars
  font?: {
    [key in RegistryItemFont]: string
  }
  docs?: string
  categories?: string[]
  meta?: { [key: string]: string }
}

if (!fs.existsSync(registryFilePath)) {
  const defaultRegistry: Registry = {
    $schema: 'https://ui.shadcn.com/schema/registry.json',
    name: registryName,
    homepage: registryHost,
    items: []
  }

  fs.writeFileSync(registryFilePath, JSON.stringify(defaultRegistry, null, 2))
  console.log(`Created registry.json`)
}

const registry = fs.readFileSync(registryFilePath, 'utf-8')

const existingRegistryJson = JSON.parse(registry) as Registry

function writeRegistry(updated: Registry) {
  fs.writeFileSync(registryFilePath, JSON.stringify(updated, null, 2))
  if (postBuild) {
    console.log(`Running test build since postBuild is true`)
    try {
      execSync('npx shadcn@latest build --output ./.build-registry', { stdio: 'inherit' })
      fs.rmSync('./.build-registry', {
        recursive: true,
        force: true
      })
    } catch (_) {
      console.dir(updated, { depth: null })
      console.error(`Build failed. Reverting changes`)
      fs.writeFileSync(registryFilePath, JSON.stringify(existingRegistryJson, null, 2))
    }
  } else {
    console.warn(`Skipping test build since postBuild is false`)
  }
}

function getFilePaths(folderPath: string) {
  return fs
    .readdirSync(folderPath, {
      recursive: true,
      withFileTypes: true
    })
    .filter((entry) => entry.isFile())
    .map((entry) => path.join(entry.parentPath, entry.name))
}

function updateRegistry() {
  const items: RegistryItem[] = []

  registryItems.forEach((item) => {
    let i = { ...item }
    if (item.files) {
      const files: RegistryItemFile[] = []
      item.files.forEach((file) => {
        if (file.path.endsWith('/') || file.path.endsWith('/*') || file.path.endsWith('/**')) {
          const folderPath = file.path.replace(/\/(\*\*|\*)?$/, '')
          const type = file.type
          const target = file.target.replace(/\/$/, '')
          const filePaths = getFilePaths(folderPath)
          filePaths.forEach((filePath) => {
            const relative = path.relative(folderPath, filePath)
            files.push({
              type: type,
              path: filePath,
              target: path.join(target.replace(/\/$/, ''), relative)
            })
          })
        } else {
          files.push(file)
        }
      })
      i = { ...i, files }
      items.push(i)
    }
  })

  const toUpdate = { ...existingRegistryJson, items: items }
  writeRegistry(toUpdate)
  process.exit(0)
}

function main() {
  updateRegistry()
}

main()
