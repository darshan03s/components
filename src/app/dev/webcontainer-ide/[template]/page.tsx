import { Client } from '../client'

type PageProps = {
  params: Promise<{
    template: string
  }>
}

export default async function Page({ params }: PageProps) {
  const { template } = await params

  return <Client template={template} />
}
