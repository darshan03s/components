import Link from 'next/link'
import Main from '@/components/main'

const Page = () => {
  return (
    <Main className="flex items-center justify-center">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col items-center gap-2">
          {process.env.NODE_ENV === 'development' && (
            <Link href="/dev/webcontainer-ide/all" className="underline">
              WebContainer IDE (Dev)
            </Link>
          )}
          <Link href="/media-player" className="underline">
            Media Player
          </Link>
          <Link href="/webcontainer-ide" className="underline">
            WebContainer IDE
          </Link>
        </div>
      </div>
    </Main>
  )
}

export default Page
