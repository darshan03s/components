'use client'

import { Suspense } from 'react'
import { WebContainerIDEProvider } from '@/components/webcontainer-ide'
import { Client } from './client'

const Page = () => {
  return (
    <WebContainerIDEProvider>
      <Suspense fallback={null}>
        <Client />
      </Suspense>
    </WebContainerIDEProvider>
  )
}

export default Page
