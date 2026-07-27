import Main from '@/components/main'
import { WebContainerIDE, WebContainerIDEProvider } from '@/components/webcontainer-ide'

const Page = () => {
  return (
    <Main className="flex items-center justify-center">
      <WebContainerIDEProvider>
        <WebContainerIDE loadFromSnapshot="/api/snapshot?template=all" />
      </WebContainerIDEProvider>
    </Main>
  )
}

export default Page
