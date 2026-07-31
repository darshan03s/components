'use client'

import { WebContainerIDEProvider } from '@/components/webcontainer-ide'
import { Client } from './client'

const Page = () => {
  return (
    <WebContainerIDEProvider>
      <Client />
    </WebContainerIDEProvider>
  )
}

export default Page
