import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: 'https://splitpay.ng', lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: 'https://splitpay.ng/browse', lastModified: new Date(), changeFrequency: 'hourly', priority: 0.9 },
    { url: 'https://splitpay.ng/auth', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  ]
}
