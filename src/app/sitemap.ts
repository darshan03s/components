import { MetadataRoute } from 'next'
import { APP_URL } from '@/metadata'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: APP_URL,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1
    }
  ]

  return [...staticPages]
}
