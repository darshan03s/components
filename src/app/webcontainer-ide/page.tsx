import Main from '@/components/main'
import { WebContainerIDE } from '@/components/webcontainer-ide/webcontainer-ide'

const Page = () => {
  return (
    <Main className="flex items-center justify-center">
      <WebContainerIDE loadFromSnapshot="/api/snapshot?template=all" />
    </Main>
  )
}

export default Page
