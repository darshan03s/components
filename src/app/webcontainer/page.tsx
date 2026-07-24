import Main from '@/components/main'
import { Playground } from '@/components/webcontainer/playground'

const Page = () => {
  return (
    <Main className="flex items-center justify-center">
      <Playground rootDir="dev" loadFromSnapshot="/api/snapshot/templates" />
    </Main>
  )
}

export default Page
