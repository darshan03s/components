export const DEFAULT_ROOT_DIR = 'workspace' as const

export const IGNORED_FOLDERS = [
  'node_modules',
  '.venv',
  'out',
  'build',
  'dist',
  '.git',
  '__pycache__',
  '.next'
]

export const IMAGE_EXTENSIONS = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'ico']

export const VIDEO_EXTENSIONS = ['mp4', 'mov', 'mkv']

export const AUDIO_EXTENSIONS = ['mp3']

export const OTHER_EXTENSIONS = ['pdf']

export const IGNORED_FS_EXTENSIONS = [...VIDEO_EXTENSIONS, ...AUDIO_EXTENSIONS, ...OTHER_EXTENSIONS]
