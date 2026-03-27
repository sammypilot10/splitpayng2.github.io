'use client'

import { Tv } from 'lucide-react'

export const OFFICIAL_LOGOS: Record<string, string> = {
  'netflix': 'https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg',
  'spotify': 'https://upload.wikimedia.org/wikipedia/commons/2/26/Spotify_logo_with_text.svg',
  'amazon': 'https://upload.wikimedia.org/wikipedia/commons/1/11/Amazon_Prime_Video_logo.svg',
  'prime': 'https://upload.wikimedia.org/wikipedia/commons/1/11/Amazon_Prime_Video_logo.svg',
  'dstv': 'https://upload.wikimedia.org/wikipedia/commons/3/36/DStv_Logo_2020.svg',
  'apple': 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg',
  'youtube': 'https://upload.wikimedia.org/wikipedia/commons/b/b8/YouTube_Logo_2017.svg',
}

export function BrandLogo({ name, size = 28 }: { domain?: string | null, name: string, size?: number }) {
  const normalized = name.toLowerCase()

  let logoSrc = null
  Object.keys(OFFICIAL_LOGOS).forEach((key) => {
    if (normalized.includes(key)) {
      logoSrc = OFFICIAL_LOGOS[key]
    }
  })

  // Apple logo is black, so on dark theme it needs a CSS invert
  const isInvert = normalized.includes('apple') ? 'invert brightness-0 filter' : ''

  if (logoSrc) {
    return (
      <img 
        src={logoSrc} 
        alt={name} 
        className={`object-contain w-full h-full drop-shadow-sm ${isInvert}`}
        style={{ maxHeight: size * 1.5 }}
      />
    )
  }

  // Fallback for custom pools
  return <Tv size={size} className="text-gray-400" />
}
