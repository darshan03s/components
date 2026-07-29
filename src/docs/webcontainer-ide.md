The `WebContainerIDE` component was added to your project.

### Wrap your component with `WebContainerIDEProvider`

```tsx title='page.tsx'
'use client'

import { useTheme } from 'next-themes'
import { WebContainerIDE, WebContainerIDEProvider } from '@/components/webcontainer-ide'

const Page = () => {
  const { resolvedTheme } = useTheme()

  return (
    <div className="flex items-center justify-center">
      <WebContainerIDEProvider rootDir="projects">
        <WebContainerIDE theme={resolvedTheme as 'light' | 'dark'} />
      </WebContainerIDEProvider>
    </div>
  )
}

export default Page
```

### Configure headers(Refer: https://webcontainers.io/guides/configuring-headers)

```
Cross-Origin-Embedder-Policy: require-corp
Cross-Origin-Opener-Policy: same-origin
```
