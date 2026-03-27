'use client'

import { useState } from 'react'
import { Tv } from 'lucide-react'

const EXACT_LOGOS: Record<string, string> = {
  'primevideo.com': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Amazon_Prime_Video_logo.svg/1024px-Amazon_Prime_Video_logo.svg.png',
  'dstv.com': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/DStv_Logo_2020.svg/1024px-DStv_Logo_2020.svg.png'
}

export function BrandLogo({ domain, name, size = 28 }: { domain: string | null, name: string, size?: number }) {
  const [error, setError] = useState(!domain)

  if (error || !domain) {
    return <Tv size={size} className="text-gray-400" />
  }

  const finalSrc = domain ? (EXACT_LOGOS[domain] || `https://icon.horse/icon/${domain}`) : "";

  return (
    <div className="relative w-full h-full flex items-center justify-center p-0.5">
      <img 
        src={finalSrc} 
        alt={name} 
        className="object-contain max-w-full max-h-full rounded-lg"
        onError={() => setError(true)}
      />
    </div>
  )
}
