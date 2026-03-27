'use client'

import { useState } from 'react'
import { Tv } from 'lucide-react'

export function BrandLogo({ domain, name, size = 28 }: { domain: string | null, name: string, size?: number }) {
  const [error, setError] = useState(!domain)

  if (error || !domain) {
    return <Tv size={size} className="text-gray-400" />
  }

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <img 
        src={`https://icon.horse/icon/${domain}`} 
        alt={name} 
        className="object-contain max-w-full max-h-full rounded-lg"
        onError={() => setError(true)}
      />
    </div>
  )
}
