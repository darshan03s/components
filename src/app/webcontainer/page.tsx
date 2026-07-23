import Main from '@/components/main'
import { Playground } from '@/components/webcontainer/playground'

const Page = () => {
  return (
    <Main className="flex items-center justify-center">
      <Playground loadFromSnapshot="/api/snapshot/vite" />
    </Main>
  )
}

export default Page
