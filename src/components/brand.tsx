import Link from 'next/link'
import { APP_NAME } from '@/metadata'

const Brand = () => {
  return (
    <Link href={'/'} className="font-semibold">
      {APP_NAME}
    </Link>
  )
}

export default Brand
